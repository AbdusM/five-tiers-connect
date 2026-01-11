"use client";

import { useState } from "react";
import { DateRange, DateFilter, getDateRangeLabel } from "@/lib/features/receipt-snap/filters";
import { exportReceipts } from "@/lib/features/receipt-snap/export";
import { Receipt } from "@/types/receipt-snap/receipt";

interface FilterBarProps {
  filter: DateFilter;
  onFilterChange: (filter: DateFilter) => void;
  receipts: Receipt[];
  filteredCount: number;
  totalCount: number;
}

const dateRanges: { value: DateRange; label: string }[] = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year", label: "This Year" },
];

export function FilterBar({
  filter,
  onFilterChange,
  receipts,
  filteredCount,
  totalCount,
}: FilterBarProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleExport = (type: "detailed" | "summary") => {
    exportReceipts(receipts, type);
    setShowExportMenu(false);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
      {/* Date Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {dateRanges.map((range) => (
          <button
            key={range.value}
            onClick={() => onFilterChange({ range: range.value })}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              filter.range === range.value
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4">
        {/* Filter count */}
        {filter.range !== "all" && (
          <p className="text-sm text-gray-500">
            {filteredCount} of {totalCount} receipts
          </p>
        )}

        {/* Export Button */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            disabled={receipts.length === 0}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              receipts.length === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-900 text-white hover:bg-gray-800"
            }`}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Export CSV
          </button>

          {/* Export Dropdown */}
          {showExportMenu && receipts.length > 0 && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowExportMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 z-20 overflow-hidden">
                <button
                  onClick={() => handleExport("detailed")}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors"
                >
                  <p className="font-medium text-gray-900">Detailed Export</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    One row per item
                  </p>
                </button>
                <button
                  onClick={() => handleExport("summary")}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors border-t border-gray-100"
                >
                  <p className="font-medium text-gray-900">Summary Export</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    One row per receipt
                  </p>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
