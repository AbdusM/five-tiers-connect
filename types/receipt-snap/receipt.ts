export interface LineItem {
  name: string;
  quantity: number;
  unitPrice?: number | null;
  price: number;
  category: string;
  sku?: string | null;
}

export interface ExtractionConfidence {
  overall: "high" | "medium" | "low";
  issues: string[];
}

export interface Receipt {
  id: string;
  merchant: string;
  merchantAddress?: string | null;
  merchantPhone?: string | null;
  date: string;
  time?: string | null;
  currency: string;
  subtotal?: number | null;
  tax?: number | null;
  tip?: number | null;
  total: number;
  paymentMethod?: string | null;
  cardLastFour?: string | null;
  items: LineItem[];
  confidence: ExtractionConfidence;
  createdAt: string;
}

export interface SpendingByCategory {
  category: string;
  total: number;
  count: number;
  color: string;
}

// Category colors for consistent UI
export const CATEGORY_COLORS: Record<string, string> = {
  Groceries: "#22c55e",
  "Food & Dining": "#f97316",
  Shopping: "#3b82f6",
  Transport: "#8b5cf6",
  Entertainment: "#ec4899",
  "Health & Pharmacy": "#14b8a6",
  Utilities: "#64748b",
  "Gas & Fuel": "#eab308",
  "Coffee & Drinks": "#a16207",
  "Personal Care": "#f472b6",
  "Home & Garden": "#84cc16",
  Electronics: "#6366f1",
  Clothing: "#e11d48",
  Other: "#6b7280",
};
