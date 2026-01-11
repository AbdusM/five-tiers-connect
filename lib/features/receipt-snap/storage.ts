/**
 * localStorage persistence for receipts
 */

import { Receipt } from "@/types/receipt-snap/receipt";

const STORAGE_KEY = "receiptsnap_receipts";
const STORAGE_VERSION = 1;

interface StorageData {
  version: number;
  receipts: Receipt[];
  updatedAt: string;
}

/**
 * Load receipts from localStorage
 */
export function loadReceipts(): Receipt[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const data: StorageData = JSON.parse(raw);

    // Version check for future migrations
    if (data.version !== STORAGE_VERSION) {
      console.warn("Storage version mismatch, clearing data");
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }

    return data.receipts || [];
  } catch (err) {
    console.error("Failed to load receipts:", err);
    return [];
  }
}

/**
 * Save receipts to localStorage
 */
export function saveReceipts(receipts: Receipt[]): void {
  if (typeof window === "undefined") return;

  try {
    const data: StorageData = {
      version: STORAGE_VERSION,
      receipts,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error("Failed to save receipts:", err);

    // Handle quota exceeded
    if (err instanceof DOMException && err.name === "QuotaExceededError") {
      console.warn("Storage quota exceeded, removing oldest receipts");
      // Keep only last 50 receipts
      const trimmed = receipts.slice(0, 50);
      const data: StorageData = {
        version: STORAGE_VERSION,
        receipts: trimmed,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }
}

/**
 * Add a single receipt
 */
export function addReceipt(receipt: Receipt): Receipt[] {
  const receipts = loadReceipts();
  const updated = [receipt, ...receipts];
  saveReceipts(updated);
  return updated;
}

/**
 * Delete a receipt by ID
 */
export function deleteReceipt(id: string): Receipt[] {
  const receipts = loadReceipts();
  const updated = receipts.filter((r) => r.id !== id);
  saveReceipts(updated);
  return updated;
}

/**
 * Clear all receipts
 */
export function clearAllReceipts(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Get storage stats
 */
export function getStorageStats(): { count: number; sizeKB: number } {
  if (typeof window === "undefined") return { count: 0, sizeKB: 0 };

  const raw = localStorage.getItem(STORAGE_KEY);
  const receipts = loadReceipts();

  return {
    count: receipts.length,
    sizeKB: raw ? Math.round(new Blob([raw]).size / 1024) : 0,
  };
}
