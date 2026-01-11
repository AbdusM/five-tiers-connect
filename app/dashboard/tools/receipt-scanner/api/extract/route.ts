import { NextRequest, NextResponse } from "next/server";

// JSON Schema for structured output - guarantees valid JSON response
const RECEIPT_SCHEMA = {
  name: "receipt_extraction",
  strict: true,
  schema: {
    type: "object",
    properties: {
      merchant: {
        type: ["string", "null"],
        description: "Store or business name",
      },
      merchant_address: {
        type: ["string", "null"],
        description: "Full address if visible",
      },
      merchant_phone: {
        type: ["string", "null"],
        description: "Phone number if visible",
      },
      date: {
        type: ["string", "null"],
        description: "Transaction date in YYYY-MM-DD format",
      },
      time: {
        type: ["string", "null"],
        description: "Transaction time in HH:MM format (24h)",
      },
      currency: {
        type: "string",
        description: "ISO currency code (USD, EUR, etc)",
      },
      subtotal: {
        type: ["number", "null"],
        description: "Subtotal before tax",
      },
      tax: {
        type: ["number", "null"],
        description: "Tax amount",
      },
      tip: {
        type: ["number", "null"],
        description: "Tip amount if present",
      },
      total: {
        type: "number",
        description: "Final total amount",
      },
      payment_method: {
        type: ["string", "null"],
        description: "Payment method (Visa, Mastercard, Cash, etc)",
      },
      card_last_four: {
        type: ["string", "null"],
        description: "Last 4 digits of card if visible",
      },
      items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Item name or description",
            },
            quantity: {
              type: "number",
              description: "Quantity purchased",
            },
            unit_price: {
              type: ["number", "null"],
              description: "Price per unit if shown separately",
            },
            price: {
              type: "number",
              description: "Total price for this line item",
            },
            category: {
              type: "string",
              enum: [
                "Groceries",
                "Food & Dining",
                "Shopping",
                "Transport",
                "Entertainment",
                "Health & Pharmacy",
                "Utilities",
                "Gas & Fuel",
                "Coffee & Drinks",
                "Personal Care",
                "Home & Garden",
                "Electronics",
                "Clothing",
                "Other",
              ],
              description: "Best matching category for this item",
            },
            sku: {
              type: ["string", "null"],
              description: "SKU or product code if visible",
            },
          },
          required: ["name", "quantity", "price", "category"],
          additionalProperties: false,
        },
      },
      confidence: {
        type: "object",
        properties: {
          overall: {
            type: "string",
            enum: ["high", "medium", "low"],
            description: "Overall extraction confidence",
          },
          issues: {
            type: "array",
            items: { type: "string" },
            description: "Any issues encountered (blurry, faded, partial, etc)",
          },
        },
        required: ["overall", "issues"],
        additionalProperties: false,
      },
    },
    required: ["currency", "total", "items", "confidence"],
    additionalProperties: false,
  },
};

// Improved prompt with one-shot example and clear instructions
const EXTRACTION_PROMPT = `You are a receipt OCR system. Extract ALL data from this receipt image with high accuracy.

## Instructions:
1. Extract the merchant name, address, and contact info from the header
2. Parse the date and time of transaction
3. Extract EVERY line item - do not skip any items
4. For each item, determine the most appropriate category
5. Extract subtotal, tax, tip (if present), and total
6. Identify payment method and last 4 card digits if shown
7. Rate your confidence and note any issues (blurry text, faded ink, cut off, etc)

## One-Shot Example:
For a Starbucks receipt showing:
- Grande Latte $5.75
- Blueberry Muffin $3.45
- Subtotal $9.20, Tax $0.83, Total $10.03
- Visa ***1234

You would extract:
{
  "merchant": "Starbucks",
  "date": "2024-03-15",
  "time": "08:32",
  "currency": "USD",
  "items": [
    {"name": "Grande Latte", "quantity": 1, "price": 5.75, "category": "Coffee & Drinks", "unit_price": null, "sku": null},
    {"name": "Blueberry Muffin", "quantity": 1, "price": 3.45, "category": "Food & Dining", "unit_price": null, "sku": null}
  ],
  "subtotal": 9.20,
  "tax": 0.83,
  "total": 10.03,
  "payment_method": "Visa",
  "card_last_four": "1234",
  "confidence": {"overall": "high", "issues": []}
}

## Important:
- Prices must be numbers (not strings)
- Use null for fields you cannot determine
- Extract ALL items even if categories are uncertain
- If receipt is partially cut off, note it in confidence.issues

Now extract data from the provided receipt image:`;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Use JPG, PNG, WebP, or GIF" },
        { status: 400 }
      );
    }

    // Check file size (max 20MB for OpenAI)
    const MAX_SIZE = 20 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Max 20MB" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = file.type;

    // Call OpenAI Vision API with Structured Outputs
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an expert receipt OCR system. Extract data with high accuracy. Always respond with valid JSON matching the provided schema.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: EXTRACTION_PROMPT },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64}`,
                  detail: "high", // Use high detail mode for better accuracy
                },
              },
            ],
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: RECEIPT_SCHEMA,
        },
        max_tokens: 4096,
        temperature: 0.1, // Low temperature for consistent extraction
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenAI API error:", errorData);

      // Handle specific errors
      if (response.status === 401) {
        return NextResponse.json(
          { error: "Invalid API key" },
          { status: 500 }
        );
      }
      if (response.status === 429) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Try again in a moment" },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: "Failed to process receipt" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 }
      );
    }

    // Parse the structured JSON response
    const extractedData = JSON.parse(content);

    // Transform to match our Receipt type
    const receipt = {
      id: crypto.randomUUID(),
      merchant: extractedData.merchant || "Unknown",
      merchantAddress: extractedData.merchant_address,
      merchantPhone: extractedData.merchant_phone,
      date: extractedData.date || new Date().toISOString().split("T")[0],
      time: extractedData.time,
      currency: extractedData.currency || "USD",
      subtotal: extractedData.subtotal,
      tax: extractedData.tax,
      tip: extractedData.tip,
      total: extractedData.total,
      paymentMethod: extractedData.payment_method,
      cardLastFour: extractedData.card_last_four,
      items: extractedData.items.map(
        (item: {
          name: string;
          quantity: number;
          unit_price: number | null;
          price: number;
          category: string;
          sku: string | null;
        }) => ({
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          price: item.price,
          category: item.category,
          sku: item.sku,
        })
      ),
      confidence: extractedData.confidence,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(receipt);
  } catch (error) {
    console.error("Extraction error:", error);

    // Handle JSON parse errors specifically
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Failed to parse receipt data" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to extract receipt data" },
      { status: 500 }
    );
  }
}
