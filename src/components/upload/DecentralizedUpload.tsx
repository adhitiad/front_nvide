// src/components/upload/DecentralizedUpload.tsx
"use client";

import { useState, useCallback } from "react";
import { useStorageStore } from "@/store/useStorageStore";
import {
  UploadCloud,
  FileVideo,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  HardDrive,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

const LARGE_FILE_THRESHOLD = 100 * 1024 * 1024; // 100 MB

interface DecentralizedUploadProps {
  onUploadComplete?: (file: { id: string; storage_id: string; filename: string; primary_provider: string }) => void;
  acceptedTypes?: string[];
  maxFiles?: number;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

function formatPercent(p: number): string {
  return Math.min(Math.max(p, 0), 100).toFixed(0);
}

const PHASE_LABELS: Record<string, string> = {
  uploading: "Mengunggah…",
  chunking: "Mempersiapkan chunk…",
  replicating: "Mereplikasi ke penyimpanan terdesentralisasi…",
  done: "Selesai",
  error: "Gagal",
};

const PHASE_COLORS: Record<string, string> = {
  uploading: "bg-blue-500",
  chunking: "bg-violet-500",
  replicating: "bg-purple-500",
  done: "bg-emerald-500",
  error: "bg-red-500",
};

function ProviderBadge({ provider }: { provider: string }) {
  const labels: Record<string, { label: string; bg: string }> = {
    oci: { label: "OCI", bg: "bg-orange-500/15 text-orange-600 border-orange-400/30" },
    storj: { label: "Storj", bg: "bg-yellow-500/15 text-yellow-600 border-yellow-400/30" },
    filebase: { label: "Filebase", bg: "bg-sky-500/15 text-sky-600 border-sky-400/30" },
  };
  const info = labels[provider] || { label: provider.toUpperCase(), bg: "bg-gray-500/15 text-gray-600 border-gray-400/30" };
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${info.bg}`}
    >
      <CheckCircle2 className="size-3.5" />
      {info.label}
    </span>
  );
}

export function DecentralizedUpload({
  onUploadComplete,
  acceptedTypes,
  maxFiles = 5,
}: DecentralizedUploadProps) {
  const { uploads, uploadFile, removeUpload, isUploading } = useStorageStore();
  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const acceptedWithDefault = acceptedTypes ?? [
    "video/*",
    "image/*",
    "audio/*",
    ".mp4",
    ".mov",
    ".mkv",
    ".avi",
    ".flv",
    ".webm",
    ".m3u8",
    ".pdf",
    ".zip",
  ];

  // Hide drag-over state when leaving the drop zone
  const resetDragOver = useCallback(() => setDragOver(false), []);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      const dropped = Array.from(e.dataTransfer.files);
      addFiles(dropped);
    },
    []
  );

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const addFiles = useCallback((rawFiles: File[]) => {
    setSelectedFiles((prev) => {
      const combined = [...prev, ...rawFiles].slice(0, maxFiles);
      return combined;
    });
  }, [maxFiles]);

  const removeSelectedFile = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        addFiles(Array.from(e.target.files));
      }
    },
    [addFiles]
  );

  const openFilePicker = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = acceptedWithDefault.join(",");
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) addFiles(Array.from(files));
    };
    input.click();
  }, [addFiles, acceptedWithDefault]);

  const startUpload = useCallback(
    async (file: File) => {
      const result = await uploadFile(file);
      if (result && onUploadComplete) {
        onUploadComplete({
          id: result.id,
          storage_id: result.storage_id,
          filename: result.filename,
          primary_provider: result.primary_provider,
        });
      }
    },
    [uploadFile, onUploadComplete]
  );

  // Reads latest store state at call-time (not frozen in a closure)
  const isFileCompleted = (filename: string) =>
    useStorageStore.getState().uploadedFiles.some(
      (f) => f.filename === filename
    );

  const progressForFile = (filename: string) =>
    uploads.find((u) => u.filename === filename);

  return (
    <div className="w-full">
      {/* ── DRAG-AND-DROP ZONE ─────────────────────────────────────────── */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={resetDragOver}
        className={`
          relative border-2 border-dashed rounded-2xl transition-all duration-200
          flex flex-col items-center justify-center gap-3 p-10 cursor-pointer
          ${
            dragOver
              ? "border-primary bg-primary/[0.06] scale-[1.01]"
              : "border-border/50 hover:border-primary/50 hover:bg-primary/[0.03]"
          }
        `}
        onClick={openFilePicker}
      >
        <div
          className={`
            size-14 rounded-2xl flex items-center justify-center transition-colors
            ${dragOver ? "bg-primary/15" : "bg-muted"}
          `}
        >
          <UploadCloud
            className={`
              size-7 transition-colors
              ${dragOver ? "text-primary" : "text-muted-foreground"}
            `}
          />
        </div>

        <div className="text-center space-y-1">
          <p className="text-sm font-semibold text-foreground">
            {dragOver ? "Lepaskan file di sini" : "Seret & Lepas file ke sini"}
          </p>
          <p className="text-xs text-muted-foreground">
            atau klik untuk memilih file (maks. {maxFiles})
          </p>
          <p className="text-[10px] text-muted-foreground/60">
            Mendukung video, audio, gambar, dan dokumen — file &gt; 100 MB akan diunggah bertahap
          </p>
        </div>

        {isUploading && (
          <div className="flex items-center gap-2 text-xs text-primary font-medium animate-pulse">
            <Loader2 className="size-3.5 animate-spin" />
            Sedang mengunggah…
          </div>
        )}
      </div>

      {/* ── SELECTED FILES QUEUE ───────────────────────────────────────── */}
      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-3">
          {selectedFiles.map((file, index) => {
            const progress = progressForFile(file.name);
            const isLarge = file.size > LARGE_FILE_THRESHOLD;
            const alreadyUploaded = isFileCompleted(file.name) || Boolean(progress?.phase === "done");

            return (
              <Card key={`${file.name}-${index}`} className="overflow-hidden">
                <CardHeader className="pb-3 flex flex-row items-center gap-3">
                  <div className="size-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                    <FileVideo className="size-5 text-purple-500" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <CardTitle className="text-sm font-bold truncate">
                      {file.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span>{formatBytes(file.size)}</span>
                      <span className="opacity-40">·</span>
                      <span>{file.type || "Tipe tidak dikenali"}</span>
                      {isLarge && (
                        <span className="text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">
                          Chunked Upload
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    size="icon-xs"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSelectedFile(index);
                    }}
                    disabled={progress?.phase === "uploading" || progress?.phase === "chunking"}
                    className="shrink-0"
                  >
                    <X className="size-3.5" />
                  </Button>
                </CardHeader>

                {/* ── PROGRESS BAR ─────────────────────────────────────────── */}
                {(progress?.phase === "uploading" ||
                  progress?.phase === "chunking" ||
                  progress?.phase === "replicating") && (
                  <CardContent className="pt-0 pb-3 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        {progress.phase === "chunking" ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <HardDrive className="size-3" />
                        )}
                        {PHASE_LABELS[progress.phase] || progress.phase}
                      </span>
                      <span className="font-bold text-foreground tabular-nums">
                        {formatPercent(progress.percent)}%
                      </span>
                    </div>

                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-200 ease-out ${
                          PHASE_COLORS[progress.phase] || "bg-primary"
                        }`}
                        style={{ width: `${progress.percent}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>{formatBytes(progress.uploadedBytes)} / {formatBytes(progress.totalSize)}</span>
                      {Boolean(progress.storageId) && (
                        <span className="text-primary/70 font-mono text-[9px]">
                          ID: {progress.storageId?.slice(0, 8)}…
                        </span>
                      )}
                    </div>
                  </CardContent>
                )}

                {/* ── DONE ─────────────────────────────────────────────────── */}
                {progress?.phase === "done" && !progress.error && (
                  <CardContent className="pt-0 pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
                        <CheckCircle2 className="size-4" />
                        Upload selesai
                      </div>
                      {progress.provider && <ProviderBadge provider={progress.provider} />}
                    </div>
                  </CardContent>
                )}

                {/* ── ERROR ────────────────────────────────────────────────── */}
                {progress?.error && (
                  <CardFooter className="pt-0 bg-red-500/5 border-t border-red-500/10">
                    <div className="flex items-center gap-2 text-xs text-red-600 w-full">
                      <AlertCircle className="size-4 shrink-0" />
                      <span className="flex-1">{progress.error}</span>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeUpload(progress.fileId);
                          if (!alreadyUploaded) setSelectedFiles((prev) => [...prev, file]);
                        }}
                      >
                        Coba Lagi
                      </Button>
                    </div>
                  </CardFooter>
                )}

                {/* ── UPLOAD BUTTON ─────────────────────────────────────────── */}
                {!progress && !alreadyUploaded && (
                  <CardFooter className="pt-0 flex justify-end">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        startUpload(file);
                        removeSelectedFile(index);
                      }}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                          Mengunggah…
                        </>
                      ) : (
                        <>
                          <UploadCloud className="size-3.5 mr-1.5" />
                          {isLarge ? "Unggah Bertahap" : "Unggah"}
                        </>
                      )}
                    </Button>
                  </CardFooter>
                )}

                {/* ── ALREADY DONE ─────────────────────────────────────────── */}
                {alreadyUploaded && !progress?.error && (
                  <CardFooter className="pt-0 bg-emerald-500/5 border-t border-emerald-500/10">
                    <div className="flex items-center gap-2 text-xs text-emerald-600">
                      <Sparkles className="size-3.5" />
                      File ini sudah diunggah sebelumnya
                    </div>
                  </CardFooter>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
