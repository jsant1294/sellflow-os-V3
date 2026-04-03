"use client";

import { useMemo, useState } from "react";
import type { GeneratedListing } from "@/lib/types";

type Mode = "price" | "improve" | "reply" | "faster";

function buildReply(item?: GeneratedListing, incoming?: string) {
  const target = item?.targetPrice ?? 0;
  const floor = item?.floorPrice ?? 0;
  const cleanIncoming = (incoming || "").trim().toLowerCase();

  if (!item) {
    return "Paste the buyer message here and I’ll help you answer with a calm, quick-close reply.";
  }

  if (!cleanIncoming) {
    return item.replies.first;
  }

  const match = cleanIncoming.match(/\$?(\d{2,5})/);
  const offer = match ? Number(match[1]) : null;

  if (offer !== null) {
    if (offer >= target) return `That works for me. If you can pick up today, it’s yours. Want the pickup details?`;
    if (offer >= floor) return `I can meet you in the middle at $${target}. If you can pick up today, I can hold it for you.`;
    return `I can’t do $${offer}, but I can let it go for $${floor} today if you can pick up now.`;
  }

  if (cleanIncoming.includes("still available") || cleanIncoming.includes("available")) {
    return item.replies.first;
  }

  if (cleanIncoming.includes("hold")) {
    return item.replies.hold;
  }

  return item.replies.negotiate;
}

function buildImprovedListing(item?: GeneratedListing, draft?: string) {
  if (draft && draft.trim()) {
    return `🚨 ${item?.itemName || "Item"} – PRICED TO MOVE 🚨\n\n${draft.trim()}\n\n✅ Pickup available today\n💬 Message me if interested\n⏱ First serious buyer takes it`;
  }
  if (!item) return "Paste your rough listing here and I’ll tighten it into a faster-selling version.";
  return item.facebook;
}

function buildFasterTips(item?: GeneratedListing) {
  if (!item) {
    return [
      "Use the same 6-8 clear photos on all three platforms.",
      "Post Facebook first, then OfferUp, then Nextdoor.",
      "Answer every message in under 5 minutes when possible.",
    ].join("\n");
  }

  return [
    `Lead with this title: ${item.titles[0]}`,
    `List at $${item.listPrice}, expect to close near $${item.targetPrice}, and do not go below $${item.floorPrice} unless same-day pickup matters more than margin.`,
    item.checklist[0],
    item.relistPlan[0],
  ].join("\n");
}

export function LucioWidget({ item }: { item?: GeneratedListing }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("price");
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => {
    switch (mode) {
      case "price":
        if (!item) return "Open an item to get a price lane from Lucio.";
        return [
          `Fast move price: $${item.floorPrice}`,
          `Best target price: $${item.targetPrice}`,
          `Strong list anchor: $${item.listPrice}`,
          `Lowest acceptable: $${item.lowestAcceptable}`,
        ].join("\n");
      case "improve":
        return buildImprovedListing(item, input);
      case "reply":
        return buildReply(item, input);
      case "faster":
        return buildFasterTips(item);
      default:
        return "";
    }
  }, [item, mode, input]);

  async function copyOutput() {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <>
      <button
        type="button"
        className="lucio-fab"
        onClick={() => setOpen((current) => !current)}
        aria-label="Toggle Lucio assistant"
      >
        <span className="lucio-dot" />
        Lucio
      </button>

      {open && (
        <div className="lucio-panel">
          <div className="lucio-panel-head">
            <div>
              <div className="badge">Lucio selling assistant</div>
              <strong>{item ? `Helping with ${item.itemName}` : "General selling help"}</strong>
            </div>
            <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>Close</button>
          </div>

          <div className="lucio-mode-row">
            <button type="button" className={`chip ${mode === "price" ? "active" : ""}`} onClick={() => setMode("price")}>Price this</button>
            <button type="button" className={`chip ${mode === "improve" ? "active" : ""}`} onClick={() => setMode("improve")}>Improve listing</button>
            <button type="button" className={`chip ${mode === "reply" ? "active" : ""}`} onClick={() => setMode("reply")}>Reply to buyer</button>
            <button type="button" className={`chip ${mode === "faster" ? "active" : ""}`} onClick={() => setMode("faster")}>Sell faster</button>
          </div>

          {(mode === "improve" || mode === "reply") && (
            <div className="field">
              <label htmlFor="lucio-input">{mode === "reply" ? "Paste the buyer message" : "Paste your rough listing"}</label>
              <textarea
                id="lucio-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === "reply" ? "Will you take $80? Is it still available?" : "Used once, works great, pickup today..."}
              />
            </div>
          )}

          <div className="lucio-output">
            <pre>{output}</pre>
          </div>

          <div className="actions">
            <button type="button" className="btn" onClick={copyOutput}>{copied ? "Copied" : "Copy Lucio output"}</button>
          </div>
        </div>
      )}
    </>
  );
}
