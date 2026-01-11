"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  processImageForOCR,
  formatFileSize,
  ProcessedImage,
} from "@/lib/features/receipt-snap/image-utils";

interface ReceiptUploadProps {
  onUpload: (file: File) => void;
  isProcessing: boolean;
}

type ProcessingState = "idle" | "preprocessing" | "uploading";

export function ReceiptUpload({ onUpload, isProcessing }: ReceiptUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [processingState, setProcessingState] = useState<ProcessingState>("idle");
  const [preview, setPreview] = useState<ProcessedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update state when parent isProcessing changes
  useEffect(() => {
    if (isProcessing) {
      setProcessingState("uploading");
    } else if (processingState === "uploading") {
      // Reset after upload completes
      setProcessingState("idle");
      setPreview(null);
    }
  }, [isProcessing, processingState]);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file");
        return;
      }

      setError(null);
      setProcessingState("preprocessing");

      try {
        // Preprocess the image
        const processed = await processImageForOCR(file);
        setPreview(processed);

        // Small delay to show the preview
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Pass to parent for OCR
        onUpload(processed.file);
      } catch (err) {
        console.error("Preprocessing error:", err);
        setError("Failed to process image. Try a different file.");
        setProcessingState("idle");
      }
    },
    [onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      if (processingState !== "idle") return;

      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) handleFile(file);
          break;
        }
      }
    },
    [handleFile, processingState]
  );

  useEffect(() => {
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  const isDisabled = processingState !== "idle";

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isDisabled && fileInputRef.current?.click()}
        className={`
          relative rounded-2xl border-2 border-dashed p-8
          transition-all duration-200 ease-out
          ${
            isDragging
              ? "border-blue-500 bg-blue-50 scale-[1.02]"
              : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
          }
          ${isDisabled ? "pointer-events-none" : "cursor-pointer"}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            // Reset input so same file can be selected again
            e.target.value = "";
          }}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-4 text-center">
          {processingState === "preprocessing" && (
            <>
              <div className="h-12 w-12 animate-pulse rounded-full bg-blue-100 flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-700">
                Optimizing image...
              </p>
            </>
          )}

          {processingState === "uploading" && (
            <>
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500" />
              <div>
                <p className="text-lg font-medium text-gray-700">
                  Extracting receipt data...
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  AI is reading your receipt
                </p>
              </div>
            </>
          )}

          {processingState === "idle" && (
            <>
              <div className="rounded-full bg-white p-4 shadow-sm">
                <svg
                  className="h-8 w-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-lg font-medium text-gray-700">
                  Drop receipt image here
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  or click to browse • paste from clipboard (⌘V)
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-100 p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Preview with stats */}
      {preview && processingState !== "idle" && (
        <div className="rounded-xl bg-white border border-gray-100 p-4 shadow-sm">
          <div className="flex gap-4">
            {/* Thumbnail */}
            <div className="flex-shrink-0">
              <img
                src={preview.preview}
                alt="Receipt preview"
                className="w-20 h-20 object-cover rounded-lg bg-gray-100"
              />
            </div>

            {/* Stats */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                Receipt image
              </p>
              <div className="mt-1 text-xs text-gray-500 space-y-0.5">
                <p>
                  {preview.width} × {preview.height} px
                </p>
                <p>
                  {formatFileSize(preview.originalSize)} →{" "}
                  <span className="text-green-600 font-medium">
                    {formatFileSize(preview.processedSize)}
                  </span>
                  {preview.processedSize < preview.originalSize && (
                    <span className="text-green-600 ml-1">
                      ({Math.round((1 - preview.processedSize / preview.originalSize) * 100)}% smaller)
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
