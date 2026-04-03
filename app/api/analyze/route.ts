import { NextResponse } from "next/server";
import type { Category, Condition, QuickScanAnalysis } from "@/lib/types";

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

const allowedCategories: Category[] = [
  "electronics",
  "decor",
  "collectibles",
  "tools",
  "toys",
  "furniture",
  "appliances",
  "fashion",
  "misc",
];

const allowedConditions: Condition[] = ["new", "like new", "good", "fair"];

function roundPrice(value: unknown) {
  const numeric = Number(value);

  if (!Number.isFinite(numeric) || numeric <= 0) {
    return 0;
  }

  return Math.max(5, Math.round(numeric / 5) * 5);
}

function normalizeCategory(value: unknown): Category {
  if (typeof value !== "string") {
    return "misc";
  }

  const normalized = value.toLowerCase().trim();
  return allowedCategories.includes(normalized as Category) ? (normalized as Category) : "misc";
}

function normalizeCondition(value: unknown): Condition {
  if (typeof value !== "string") {
    return "good";
  }

  const normalized = value.toLowerCase().trim();
  return allowedConditions.includes(normalized as Condition) ? (normalized as Condition) : "good";
}

function normalizeQuantity(value: unknown) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? Math.max(1, Math.round(numeric)) : 1;
}

function normalizeAnalysis(payload: unknown): QuickScanAnalysis {
  const record = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const pricingRecord = record.pricing && typeof record.pricing === "object"
    ? (record.pricing as Record<string, unknown>)
    : {};

  const fast = roundPrice(pricingRecord.fast);
  const target = roundPrice(pricingRecord.target);
  const max = roundPrice(pricingRecord.max);
  const lowestAcceptable = roundPrice(pricingRecord.lowestAcceptable || fast * 0.9);

  return {
    itemName: typeof record.itemName === "string" && record.itemName.trim() ? record.itemName.trim() : "Marketplace item",
    category: normalizeCategory(record.category),
    condition: normalizeCondition(record.condition),
    notes: typeof record.notes === "string" ? record.notes.trim() : "",
    quantity: normalizeQuantity(record.quantity),
    pricing: {
      fast: fast || 20,
      target: target || max || 30,
      max: max || target || 40,
      lowestAcceptable: lowestAcceptable || fast || 20,
    },
  };
}

function extractContentText(payload: unknown) {
  const record = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const choices = Array.isArray(record.choices) ? record.choices : [];
  const firstChoice = choices[0] && typeof choices[0] === "object" ? (choices[0] as Record<string, unknown>) : {};
  const message = firstChoice.message && typeof firstChoice.message === "object"
    ? (firstChoice.message as Record<string, unknown>)
    : {};

  return typeof message.content === "string" ? message.content : "";
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "QuickScan AI is not configured yet. Add OPENAI_API_KEY to enable photo analysis." },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("image");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Upload an image before running QuickScan AI." }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image uploads are supported." }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Image is too large. Use a file under 8MB." }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const dataUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: [
              {
                type: "text",
                text: [
                  "You are QuickScan AI for a local resale workflow.",
                  "Analyze the uploaded image and return JSON only.",
                  "Use this schema exactly:",
                  '{"itemName":"string","category":"electronics|decor|collectibles|tools|toys|furniture|appliances|fashion|misc","condition":"new|like new|good|fair","quantity":1,"notes":"short factual summary","pricing":{"fast":0,"target":0,"max":0,"lowestAcceptable":0}}',
                  "Pricing rules:",
                  "- fast = quick sale price",
                  "- target = realistic close price",
                  "- max = optimistic listing price",
                  "- lowestAcceptable = hard floor if visible value supports it",
                  "Keep notes concise and factual. Do not mention uncertainty unless necessary.",
                ].join("\n"),
              },
            ],
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this item photo for a local resale listing intake.",
              },
              {
                type: "image_url",
                image_url: {
                  url: dataUrl,
                },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `OpenAI request failed: ${errorText}` },
        { status: 502 }
      );
    }

    const payload = await response.json();
    const content = extractContentText(payload);

    if (!content) {
      return NextResponse.json({ error: "QuickScan AI returned an empty response." }, { status: 502 });
    }

    const analysis = normalizeAnalysis(JSON.parse(content));
    return NextResponse.json({ analysis });
  } catch (error) {
    const message = error instanceof Error ? error.message : "QuickScan AI failed unexpectedly.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}