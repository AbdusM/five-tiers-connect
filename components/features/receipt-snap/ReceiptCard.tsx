"use client";

import { useState } from "react";
import { Receipt, CATEGORY_COLORS } from "@/types/receipt-snap/receipt";

interface ReceiptCardProps {
  receipt: Receipt;
  onDelete?: (id: string) => void;
}

const currencySymbols: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  CAD: "C$",
  AUD: "A$",
};

function formatCurrency(amount: number, currency: string): string {
  const symbol = currencySymbols[currency] || "$";
  return `${symbol}${amount.toFixed(2)}`;
}

function ConfidenceBadge({ confidence }: { confidence: Receipt["confidence"] }) {
  const colors = {
    high: "bg-green-100 text-green-700",
    medium: "bg-yellow-100 text-yellow-700",
    low: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors[confidence.overall]}`}
    >
      {confidence.overall} confidence
    </span>
  );
}

export function ReceiptCard({ receipt, onDelete }: ReceiptCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleDelete = () => {
    if (onDelete) {
      onDelete(receipt.id);
    }
    setShowConfirm(false);
  };

  return (
    <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
      {/* Header - always visible */}
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {receipt.merchant}
              </h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className={`h-5 w-5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{receipt.date}</span>
              {receipt.time && (
                <>
                  <span>•</span>
                  <span>{receipt.time}</span>
                </>
              )}
              <span>•</span>
              <span>{receipt.items.length} items</span>
            </div>
          </div>
          <div className="text-right flex-shrink-0 ml-4">
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(receipt.total, receipt.currency)}
            </p>
            {receipt.paymentMethod && (
              <p className="text-xs text-gray-400">
                {receipt.paymentMethod}
                {receipt.cardLastFour && ` ••••${receipt.cardLastFour}`}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          {/* Merchant details */}
          {receipt.merchantAddress && (
            <p className="mt-3 text-xs text-gray-400 truncate">
              {receipt.merchantAddress}
            </p>
          )}

          {/* Confidence indicator */}
          {receipt.confidence && (
            <div className="mt-3">
              <ConfidenceBadge confidence={receipt.confidence} />
              {receipt.confidence.issues.length > 0 && (
                <p className="mt-1 text-xs text-gray-400">
                  {receipt.confidence.issues.join(", ")}
                </p>
              )}
            </div>
          )}

          {/* Line Items */}
          {receipt.items.length > 0 && (
            <div className="mt-4">
              <div className="space-y-2">
                {receipt.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-gray-700 truncate">{item.name}</span>
                      {item.quantity > 1 && (
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          x{item.quantity}
                        </span>
                      )}
                      <span
                        className="rounded-full px-2 py-0.5 text-xs flex-shrink-0"
                        style={{
                          backgroundColor: `${CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Other}20`,
                          color: CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Other,
                        }}
                      >
                        {item.category}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900 ml-2 flex-shrink-0">
                      {formatCurrency(item.price, receipt.currency)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-3 border-t border-gray-100 pt-3 space-y-1">
                {receipt.subtotal != null && (
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Subtotal</span>
                    <span>{formatCurrency(receipt.subtotal, receipt.currency)}</span>
                  </div>
                )}
                {receipt.tax != null && (
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Tax</span>
                    <span>{formatCurrency(receipt.tax, receipt.currency)}</span>
                  </div>
                )}
                {receipt.tip != null && (
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Tip</span>
                    <span>{formatCurrency(receipt.tip, receipt.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-semibold text-gray-900 pt-1">
                  <span>Total</span>
                  <span>{formatCurrency(receipt.total, receipt.currency)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Delete button */}
          {onDelete && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              {showConfirm ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Delete this receipt?</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowConfirm(false)}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowConfirm(true)}
                  className="text-sm text-gray-400 hover:text-red-500 transition-colors"
                >
                  Delete receipt
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
