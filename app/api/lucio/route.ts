import { NextResponse } from "next/server";
import type { LucioRequestPayload, LucioResponsePayload } from "@/lib/types";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

function sanitizeModelText(value: string) {
  const leakMarkers = [
    '","copyText"',
    "','copyText'",
    '"copyText":',
    "'copyText':",
    "},{",
    "}]}",
  ];

  let sanitized = value.replace(/\s+/g, " ").trim();

  for (const marker of leakMarkers) {
    const markerIndex = sanitized.indexOf(marker);
    if (markerIndex >= 0) {
      sanitized = sanitized.slice(0, markerIndex).trim();
    }
  }

  return sanitized.replace(/[\s,:;]+$/g, "").trim();
}

function normalizeString(value: unknown, fallback: string) {
  if (typeof value !== "string") {
    return fallback;
  }

  const sanitized = sanitizeModelText(value);
  return sanitized ? sanitized : fallback;
}

function normalizeResponse(payload: unknown): LucioResponsePayload {
  const record = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const cards = Array.isArray(record.cards) ? record.cards : [];

  return {
    headline: normalizeString(record.headline, "Lucio is ready with a practical next move."),
    cards: cards
      .slice(0, 4)
      .map((card) => {
        const entry = card && typeof card === "object" ? (card as Record<string, unknown>) : {};
        const title = normalizeString(entry.title, "Lucio");
        const body = normalizeString(entry.body, "No guidance returned.");
        const copyText = normalizeString(entry.copyText, body);

        return { title, body, copyText };
      })
      .filter((card) => {
        const combined = `${card.title} ${card.body} ${card.copyText}`;
        return card.body.length > 0 && !/[{}][^\s]*$/.test(combined) && !combined.includes("copyText");
      }),
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
      { error: "Lucio AI is not configured yet. Add OPENAI_API_KEY to enable contextual assistance." },
      { status: 500 }
    );
  }

  try {
    const payload = (await request.json()) as LucioRequestPayload;
    const model = process.env.OPENAI_LUCIO_MODEL || process.env.OPENAI_MODEL || "gpt-4o-mini";

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
                  "You are Lucio, a local resale strategist inside SellFlow.",
                  "Stay narrow and practical. Do not act like a general chatbot.",
                  "Use only the provided context.",
                  "Prioritize realistic local resale guidance, concise phrasing, and fast action.",
                  "Avoid inflated collector assumptions unless strongly supported.",
                  "When urgency is high, optimize for closing speed.",
                  "If listingState is provided, use it directly.",
                  "If listingState.status is posted and listingState.isStale is true, explicitly decide whether to hold, reprice, retitle, relist, or bundle.",
                  "For stale listings, prefer concrete moves with timing and price-action guidance using target or floor price when relevant.",
                  "For stale listings in faster mode, include at least one card focused on stale-listing recovery.",
                  "If the item is draft, bias the advice toward getting it posted quickly.",
                  "If the item is sold, bias the advice toward lessons that improve the next similar listing.",
                  "Return JSON only with this schema:",
                  '{"headline":"string","cards":[{"title":"string","body":"string","copyText":"string"}]}',
                  "Return 2 to 4 cards.",
                  "Each card must be short, specific, and mobile-friendly.",
                  "For reply mode, produce responses the user can copy directly.",
                  "For improve mode, include one polished listing version.",
                  "For price mode, explain the lane briefly and give concrete numbers if present in the payload.",
                  "For faster mode, recommend immediate execution steps only.",
                  "When stale-listing context exists, do not give generic advice. Make the recommendation depend on ageHours, status, urgency, and current prices.",
                ].join("\n"),
              },
            ],
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: JSON.stringify(payload, null, 2),
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `OpenAI request failed: ${errorText}` }, { status: 502 });
    }

    const result = await response.json();
    const content = extractContentText(result);

    if (!content) {
      return NextResponse.json({ error: "Lucio returned an empty response." }, { status: 502 });
    }

    const normalized = normalizeResponse(JSON.parse(content));

    if (normalized.cards.length === 0) {
      return NextResponse.json({ error: "Lucio returned no usable cards." }, { status: 502 });
    }

    return NextResponse.json(normalized);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lucio failed unexpectedly.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}