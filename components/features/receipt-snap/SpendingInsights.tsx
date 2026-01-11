"use client";

import { Receipt, SpendingByCategory, CATEGORY_COLORS } from "@/types/receipt-snap/receipt";
import { useMemo } from "react";

interface SpendingInsightsProps {
  receipts: Receipt[];
}

export function SpendingInsights({ receipts }: SpendingInsightsProps) {
  const { totalSpent, categoryBreakdown, topMerchants, avgPerReceipt } = useMemo(() => {
    const total = receipts.reduce((sum, r) => sum + r.total, 0);
    const avg = receipts.length > 0 ? total / receipts.length : 0;

    // Category breakdown from items
    const categoryMap = new Map<string, { total: number; count: number }>();
    receipts.forEach((r) => {
      r.items.forEach((item) => {
        const cat = item.category || "Other";
        const existing = categoryMap.get(cat) || { total: 0, count: 0 };
        categoryMap.set(cat, {
          total: existing.total + item.price,
          count: existing.count + 1,
        });
      });
    });

    const categories: SpendingByCategory[] = Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        total: data.total,
        count: data.count,
        color: CATEGORY_COLORS[category] || CATEGORY_COLORS.Other,
      }))
      .sort((a, b) => b.total - a.total);

    // Top merchants
    const merchantMap = new Map<string, number>();
    receipts.forEach((r) => {
      merchantMap.set(r.merchant, (merchantMap.get(r.merchant) || 0) + r.total);
    });
    const merchants = Array.from(merchantMap.entries())
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    return {
      totalSpent: total,
      categoryBreakdown: categories,
      topMerchants: merchants,
      avgPerReceipt: avg,
    };
  }, [receipts]);

  if (receipts.length === 0) {
    return (
      <div className="rounded-xl bg-gray-50 border border-gray-200 border-dashed p-6 text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
          <svg
            className="h-6 w-6 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <p className="text-sm font-medium text-gray-900">No spending data yet</p>
        <p className="text-xs text-gray-500 mt-1">
          Upload receipts to see insights
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Total Spent */}
      <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white">
        <p className="text-sm font-medium text-blue-100">Total Spent</p>
        <p className="text-4xl font-bold">${totalSpent.toFixed(2)}</p>
        <div className="mt-2 flex items-center gap-4 text-sm text-blue-100">
          <span>{receipts.length} receipt{receipts.length !== 1 ? "s" : ""}</span>
          <span>•</span>
          <span>${avgPerReceipt.toFixed(2)} avg</span>
        </div>
      </div>

      {/* Category Breakdown */}
      {categoryBreakdown.length > 0 && (
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            By Category
          </h3>
          <div className="space-y-3">
            {categoryBreakdown.map((cat) => (
              <div key={cat.category}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-gray-700">{cat.category}</span>
                    <span className="text-xs text-gray-400">
                      ({cat.count} item{cat.count !== 1 ? "s" : ""})
                    </span>
                  </div>
                  <span className="font-medium text-gray-900">
                    ${cat.total.toFixed(2)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max((cat.total / totalSpent) * 100, 2)}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Merchants */}
      {topMerchants.length > 0 && (
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Top Merchants
          </h3>
          <div className="space-y-2">
            {topMerchants.map((m, idx) => (
              <div
                key={m.name}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-xs w-4">{idx + 1}</span>
                  <span className="text-gray-700">{m.name}</span>
                </div>
                <span className="font-medium text-gray-900">
                  ${m.total.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
