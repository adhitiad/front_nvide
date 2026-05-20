// src/lib/types/storage.ts
// Type definitions for decentralized storage (OCI, Storj, Filebase)

export type StorageProvider = "oci" | "storj" | "filebase";
export type ReplicationStatus = "pending" | "ready" | "failed";

export interface StorageFile {
  id: string;
  storage_id: string;
  filename: string;
  mime_type: string;
  file_size: number;
  primary_provider: StorageProvider;
  ipfs_hash?: string | null;
  providers: ProviderReplication[];
  created_at: string;
  updated_at: string;
}

export interface ProviderReplication {
  provider: StorageProvider;
  status: ReplicationStatus;
  url?: string | null;
  replicated_at?: string | null;
  error?: string | null;
}

export interface PresignedUrlResponse {
  url: string;
  provider: StorageProvider;
  expires_at: string;
}

export interface PresignedUrlsFallback {
  urls: Array<{
    provider: StorageProvider;
    url: string;
    expires_at: string;
  }>;
  primary_provider: StorageProvider;
}

export interface UploadProgress {
  fileId: string;
  filename: string;
  totalSize: number;
  uploadedBytes: number;
  percent: number;
  phase: "chunking" | "uploading" | "finalizing" | "replicating" | "done";
  provider?: StorageProvider;
  error?: string | null;
  storageId?: string | null;
}

export interface UploadRequestOptions {
  filename: string;
  mimeType: string;
  size: number;
  metadata?: Record<string, string>;
}

export interface MultipartUploadInit {
  upload_id: string;
  chunk_size: number;
  presigned_parts: Array<{
    part_number: number;
    url: string;
  }>;
  primary_provider: StorageProvider;
}

export interface MultipartUploadComplete {
  storage_id: string;
  file: StorageFile;
}
