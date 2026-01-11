"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { ReceiptUpload } from "@/components/features/receipt-snap/ReceiptUpload";
import { ReceiptCard } from "@/components/features/receipt-snap/ReceiptCard";
import { SpendingInsights } from "@/components/features/receipt-snap/SpendingInsights";
import { FilterBar } from "@/components/features/receipt-snap/FilterBar";
import { Receipt } from "@/types/receipt-snap/receipt";
import {
  loadReceipts,
  saveReceipts,
  deleteReceipt,
  clearAllReceipts,
  getStorageStats,
} from "@/lib/features/receipt-snap/storage";
import { DateFilter, filterReceiptsByDate } from "@/lib/features/receipt-snap/filters";

export default function Home() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilter>({ range: "all" });

  // Load receipts from localStorage on mount
  useEffect(() => {
    const saved = loadReceipts();
    setReceipts(saved);
    setIsLoaded(true);
  }, []);

  // Save receipts to localStorage when they change
  useEffect(() => {
    if (isLoaded) {
      saveReceipts(receipts);
    }
  }, [receipts, isLoaded]);

  // Filter receipts by date
  const filteredReceipts = useMemo(() => {
    return filterReceiptsByDate(receipts, dateFilter);
  }, [receipts, dateFilter]);

  const handleUpload = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to process receipt");
      }

      const receipt: Receipt = await response.json();
      setReceipts((prev) => [receipt, ...prev]);

      // Reset filter to "all" so new receipt is visible
      if (dateFilter.range !== "all") {
        setDateFilter({ range: "all" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsProcessing(false);
    }
  }, [dateFilter.range]);

  const handleDelete = useCallback((id: string) => {
    setReceipts((prev) => prev.filter((r) => r.id !== id));
    deleteReceipt(id);
  }, []);

  const handleClearAll = useCallback(() => {
    clearAllReceipts();
    setReceipts([]);
    setShowClearConfirm(false);
  }, []);

  const stats = getStorageStats();

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-500 flex items-center justify-center">
                <svg
                  className="h-5 w-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ReceiptSnap</h1>
                {receipts.length > 0 && (
                  <p className="text-xs text-gray-500">
                    {receipts.length} receipt{receipts.length !== 1 ? "s" : ""} saved
                  </p>
                )}
              </div>
            </div>

            {/* Clear all button */}
            {receipts.length > 0 && (
              <div className="relative">
                {showClearConfirm ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Clear all?</span>
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleClearAll}
                      className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      Clear
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="text-sm text-gray-400 hover:text-red-500 transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Area */}
            <ReceiptUpload onUpload={handleUpload} isProcessing={isProcessing} />

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-100 p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Filter & Export Bar */}
            {receipts.length > 0 && (
              <FilterBar
                filter={dateFilter}
                onFilterChange={setDateFilter}
                receipts={filteredReceipts}
                filteredCount={filteredReceipts.length}
                totalCount={receipts.length}
              />
            )}

            {/* Receipts List */}
            {filteredReceipts.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-900">
                    {dateFilter.range === "all" ? "All Receipts" : "Filtered Receipts"}
                  </h2>
                  <p className="text-xs text-gray-400">
                    {stats.sizeKB} KB stored
                  </p>
                </div>
                <div className="space-y-4">
                  {filteredReceipts.map((receipt) => (
                    <ReceiptCard
                      key={receipt.id}
                      receipt={receipt}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* No results for filter */}
            {isLoaded && receipts.length > 0 && filteredReceipts.length === 0 && (
              <div className="text-center py-12">
                <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-gray-900 font-medium">No receipts in this period</p>
                <p className="text-sm text-gray-500 mt-1">
                  Try selecting a different date range
                </p>
                <button
                  onClick={() => setDateFilter({ range: "all" })}
                  className="mt-4 text-sm text-blue-500 hover:text-blue-600"
                >
                  View all receipts
                </button>
              </div>
            )}

            {/* Empty State */}
            {isLoaded && receipts.length === 0 && !isProcessing && (
              <div className="text-center py-12">
                <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
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
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <p className="text-gray-900 font-medium">No receipts yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  Upload a receipt to get started
                </p>
              </div>
            )}

            {/* Loading state */}
            {!isLoaded && (
              <div className="text-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500 mx-auto" />
              </div>
            )}
          </div>

          {/* Sidebar - Insights (uses filtered receipts) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <SpendingInsights receipts={filteredReceipts} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
