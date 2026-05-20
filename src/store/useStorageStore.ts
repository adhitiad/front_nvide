// src/store/useStorageStore.ts
// Zustand store for decentralized storage, uploads, and presigned URLs

import { create } from "zustand";
import api from "@/lib/api";
import type {
  StorageFile,
  UploadProgress,
  PresignedUrlResponse,
  PresignedUrlsFallback,
  UploadRequestOptions,
  MultipartUploadInit,
  MultipartUploadComplete,
} from "@/lib/types/storage";

interface StorageState {
  uploads: UploadProgress[];
  uploadedFiles: StorageFile[];
  isUploading: boolean;
  uploadError: string | null;

  uploadFile: (file: File, metadata?: Record<string, string>) => Promise<StorageFile | null>;
  getPresignedURL: (storageId: string) => Promise<string>;
  getFallbackURLs: (storageId: string) => Promise<Record<string, string>>;
  updateUploadProgress: (fileId: string, progress: Partial<UploadProgress>) => void;
  removeUpload: (fileId: string) => void;
  retryReplication: (storageId: string) => Promise<void>;
}

function generateFileId(file: File): string {
  return `${file.name}-${file.size}-${Date.now()}`;
}

export const useStorageStore = create<StorageState>((set, get) => ({
  uploads: [],
  uploadedFiles: [],
  isUploading: false,
  uploadError: null,

  uploadFile: async (file: File, metadata?: Record<string, string>): Promise<StorageFile | null> => {
    set({ isUploading: true, uploadError: null });

    const fileId = generateFileId(file);

    // Register upload progress entry
    set((state) => ({
      uploads: [
        ...state.uploads,
        {
          fileId,
          filename: file.name,
          totalSize: file.size,
          uploadedBytes: 0,
          percent: 0,
          phase: "uploading",
          error: null,
        },
      ],
    }));

    const progressEntry = get().uploads.find((u) => u.fileId === fileId);

    try {
      const isLargeFile = file.size > 100 * 1024 * 1024;

      // ── Simple upload for files ≤ 100 MB ──────────────────────────────────
      if (!isLargeFile) {
        const form = new FormData();
        form.append("file", file);
        if (metadata) {
          for (const [k, v] of Object.entries(metadata)) {
            form.append(k, v);
          }
        }

        const response: { success: true; data: StorageFile } = await api.post("/storage/upload", form, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (p: any) => {
            const percent = Math.round((p.loaded / (p.total || file.size)) * 100);
            const uploadedBytes = Math.round((percent / 100) * file.size);
            get().updateUploadProgress(fileId, {
              percent,
              uploadedBytes,
              phase: percent === 100 ? "replicating" : "uploading",
            });
          },
        });

        const storageFile = response.data;

        // Mark upload done and store file
        set((state) => ({
          isUploading: false,
          uploads: state.uploads.map((u) =>
            u.fileId === fileId
              ? { ...u, percent: 100, phase: "done" }
              : u
          ),
          uploadedFiles: [...state.uploadedFiles, storageFile],
        }));

        return storageFile;
      }

      // ── Chunked multipart upload for files > 100 MB ───────────────────────
      // Phase 1: init multipart upload
      get().updateUploadProgress(fileId, { phase: "chunking", percent: 1 });

      const initResponse: {
        success: true;
        data: MultipartUploadInit & { storage_id: string };
      } = await api.post("/storage/upload/multipart/init", {
        filename: file.name,
        mime_type: file.type,
        size: file.size,
        metadata: metadata ?? {},
      });

      const { upload_id, chunk_size, presigned_parts, primary_provider, storage_id } = initResponse.data;

      const totalChunks = Math.ceil(file.size / chunk_size);

      // Phase 2: upload each chunk
      get().updateUploadProgress(fileId, { phase: "uploading", percent: 10 });

      for (let i = 0; i < presigned_parts.length; i++) {
        const part = presigned_parts[i];
        const start = i * chunk_size;
        const end = Math.min(start + chunk_size, file.size);
        const chunkBlob = file.slice(start, end);

        await fetch(part.url, {
          method: "PUT",
          body: chunkBlob,
        });

        const rawPercent = ((i + 1) / totalChunks) * 80; // 10 → 90
        const uploadedBytes = Math.round(((i + 1) / totalChunks) * file.size);

        get().updateUploadProgress(fileId, {
          percent: rawPercent,
          uploadedBytes,
          storageId: storage_id,
        });
      }

      // Phase 3: complete multipart upload
      get().updateUploadProgress(fileId, { phase: "replicating", percent: 95 });

      const completeResponse: { success: true; data: MultipartUploadComplete } = await api.post(
        `/storage/upload/multipart/complete/${upload_id}`
      );

      if (progressEntry) {
        get().updateUploadProgress(fileId, { percent: 100, phase: "done" });
      }

      set((state) => ({
        isUploading: false,
        uploads: state.uploads.map((u) =>
          u.fileId === fileId
            ? { ...u, percent: 100, phase: "done" }
            : u
        ),
        uploadedFiles: [...state.uploadedFiles, completeResponse.data.file],
      }));

      return completeResponse.data.file;
    } catch (err: any) {
      const errorMsg = err?.error?.message || err?.message || "Upload gagal";
      set((state) => ({
        isUploading: false,
        uploadError: errorMsg,
        uploads: state.uploads.map((u) =>
          u.fileId === fileId ? { ...u, error: errorMsg } : u
        ),
      }));
      return null;
    }
  },

  getPresignedURL: async (storageId: string): Promise<string> => {
    const res: PresignedUrlResponse = await api.get(`/storage/${storageId}/url`);
    return res.url;
  },

  getFallbackURLs: async (storageId: string): Promise<Record<string, string>> => {
    const res: PresignedUrlsFallback = await api.get(`/storage/${storageId}/urls`);
    const map: Record<string, string> = {};
    for (const entry of res.urls) {
      map[entry.provider] = entry.url;
    }
    return map;
  },

  updateUploadProgress: (fileId: string, progress: Partial<UploadProgress>) => {
    set((state) => ({
      uploads: state.uploads.map((u) =>
        u.fileId === fileId ? { ...u, ...progress } : u
      ),
    }));
  },

  removeUpload: (fileId: string) => {
    set((state) => ({
      uploads: state.uploads.filter((u) => u.fileId !== fileId),
    }));
  },

  retryReplication: async (storageId: string) => {
    set({ isUploading: true, uploadError: null });
    try {
      await api.post(`/storage/${storageId}/retry-replication`);
    } catch (err: any) {
      set({ uploadError: err?.error?.message || "Retry replikasi gagal" });
    } finally {
      set({ isUploading: false });
    }
  },
}));
