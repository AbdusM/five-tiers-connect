/**
 * Export receipts to CSV
 */

import { Receipt } from "@/types/receipt-snap/receipt";

/**
 * Convert receipts to CSV string
 */
export function receiptsToCSV(receipts: Receipt[]): string {
  // Headers
  const headers = [
    "Date",
    "Time",
    "Merchant",
    "Item",
    "Category",
    "Quantity",
    "Price",
    "Subtotal",
    "Tax",
    "Tip",
    "Total",
    "Payment Method",
    "Currency",
  ];

  const rows: string[][] = [];

  // Create a row for each line item
  receipts.forEach((receipt) => {
    if (receipt.items.length === 0) {
      // Receipt with no items - single row
      rows.push([
        receipt.date || "",
        receipt.time || "",
        receipt.merchant || "",
        "",
        "",
        "",
        "",
        receipt.subtotal?.toString() || "",
        receipt.tax?.toString() || "",
        receipt.tip?.toString() || "",
        receipt.total.toString(),
        receipt.paymentMethod || "",
        receipt.currency || "USD",
      ]);
    } else {
      // One row per item
      receipt.items.forEach((item, idx) => {
        rows.push([
          receipt.date || "",
          receipt.time || "",
          receipt.merchant || "",
          item.name,
          item.category,
          item.quantity.toString(),
          item.price.toString(),
          idx === 0 ? (receipt.subtotal?.toString() || "") : "",
          idx === 0 ? (receipt.tax?.toString() || "") : "",
          idx === 0 ? (receipt.tip?.toString() || "") : "",
          idx === 0 ? receipt.total.toString() : "",
          idx === 0 ? (receipt.paymentMethod || "") : "",
          idx === 0 ? (receipt.currency || "USD") : "",
        ]);
      });
    }
  });

  // Escape CSV values
  const escapeCSV = (value: string): string => {
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  // Build CSV string
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map(escapeCSV).join(",")),
  ].join("\n");

  return csvContent;
}

/**
 * Create summary CSV (one row per receipt)
 */
export function receiptsSummaryToCSV(receipts: Receipt[]): string {
  const headers = [
    "Date",
    "Time",
    "Merchant",
    "Items Count",
    "Subtotal",
    "Tax",
    "Tip",
    "Total",
    "Payment Method",
    "Currency",
    "Categories",
  ];

  const rows = receipts.map((receipt) => {
    const categories = [...new Set(receipt.items.map((i) => i.category))].join("; ");
    return [
      receipt.date || "",
      receipt.time || "",
      receipt.merchant || "",
      receipt.items.length.toString(),
      receipt.subtotal?.toString() || "",
      receipt.tax?.toString() || "",
      receipt.tip?.toString() || "",
      receipt.total.toString(),
      receipt.paymentMethod || "",
      receipt.currency || "USD",
      categories,
    ];
  });

  const escapeCSV = (value: string): string => {
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  return [
    headers.join(","),
    ...rows.map((row) => row.map(escapeCSV).join(",")),
  ].join("\n");
}

/**
 * Download CSV file
 */
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export receipts with automatic filename
 */
export function exportReceipts(
  receipts: Receipt[],
  type: "detailed" | "summary" = "detailed"
): void {
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];

  if (type === "summary") {
    const csv = receiptsSummaryToCSV(receipts);
    downloadCSV(csv, `receipts-summary-${dateStr}.csv`);
  } else {
    const csv = receiptsToCSV(receipts);
    downloadCSV(csv, `receipts-${dateStr}.csv`);
  }
}
