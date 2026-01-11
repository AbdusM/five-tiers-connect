/**
 * Client-side image preprocessing for faster OCR
 * - Resizes large images to optimal OCR size
 * - Compresses to reduce upload time
 * - Converts to JPEG for consistency
 */

export interface ProcessedImage {
  file: File;
  preview: string;
  originalSize: number;
  processedSize: number;
  width: number;
  height: number;
}

// Optimal settings for receipt OCR
const MAX_DIMENSION = 2048; // OpenAI recommends max 2048px for detail:high
const MIN_DIMENSION = 768; // Don't go too small or text becomes unreadable
const JPEG_QUALITY = 0.85; // Good balance of quality vs size

/**
 * Load an image file into an HTMLImageElement
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Calculate new dimensions maintaining aspect ratio
 */
function calculateDimensions(
  width: number,
  height: number
): { width: number; height: number } {
  // If already within bounds, return original
  if (width <= MAX_DIMENSION && height <= MAX_DIMENSION) {
    // But ensure minimum size for readability
    if (width >= MIN_DIMENSION || height >= MIN_DIMENSION) {
      return { width, height };
    }
  }

  // Scale down if too large
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
    return {
      width: Math.round(width * ratio),
      height: Math.round(height * ratio),
    };
  }

  // Scale up if too small (rare for receipts)
  if (width < MIN_DIMENSION && height < MIN_DIMENSION) {
    const ratio = Math.max(MIN_DIMENSION / width, MIN_DIMENSION / height);
    return {
      width: Math.round(width * ratio),
      height: Math.round(height * ratio),
    };
  }

  return { width, height };
}

/**
 * Apply basic image enhancements for better OCR
 */
function enhanceForOCR(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // Simple contrast enhancement
  // Find min/max luminance
  let min = 255;
  let max = 0;

  for (let i = 0; i < data.length; i += 4) {
    const luminance = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    if (luminance < min) min = luminance;
    if (luminance > max) max = luminance;
  }

  // Apply contrast stretch if needed
  const range = max - min;
  if (range < 200 && range > 0) {
    const factor = 255 / range;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, (data[i] - min) * factor)); // R
      data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - min) * factor)); // G
      data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - min) * factor)); // B
    }
    ctx.putImageData(imageData, 0, 0);
  }
}

/**
 * Convert canvas to File
 */
function canvasToFile(
  canvas: HTMLCanvasElement,
  originalName: string,
  quality: number
): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to create blob"));
          return;
        }
        const fileName = originalName.replace(/\.[^/.]+$/, "") + ".jpg";
        const file = new File([blob], fileName, { type: "image/jpeg" });
        resolve(file);
      },
      "image/jpeg",
      quality
    );
  });
}

/**
 * Main function: Process image for optimal OCR
 */
export async function processImageForOCR(file: File): Promise<ProcessedImage> {
  const originalSize = file.size;

  // Load image
  const img = await loadImage(file);
  const originalWidth = img.width;
  const originalHeight = img.height;

  // Calculate new dimensions
  const { width, height } = calculateDimensions(originalWidth, originalHeight);

  // Create canvas and draw resized image
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  // Use high-quality image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Draw image
  ctx.drawImage(img, 0, 0, width, height);

  // Apply OCR enhancements (contrast boost)
  enhanceForOCR(ctx, width, height);

  // Convert to optimized JPEG
  const processedFile = await canvasToFile(canvas, file.name, JPEG_QUALITY);

  // Create preview URL
  const preview = canvas.toDataURL("image/jpeg", 0.5);

  // Cleanup
  URL.revokeObjectURL(img.src);

  return {
    file: processedFile,
    preview,
    originalSize,
    processedSize: processedFile.size,
    width,
    height,
  };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
