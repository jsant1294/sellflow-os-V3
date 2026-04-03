"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { GeneratedListing, ItemStatus } from "@/lib/types";
import { updateItemStatus } from "@/lib/storage";

type PlatformKey = "facebook" | "offerup" | "nextdoor";

type Step = {
  key: PlatformKey;
  title: string;
  body: string;
  appHref: string;
  webHref: string;
  copyLabel: string;
};

function QuickActionButton({ href, label }: { href: string; label: string }) {
  return (
    <a className="btn-secondary quick-open" href={href} target="_blank" rel="noreferrer">
      {label}
    </a>
  );
}

export function MobilePostFlow({ item }: { item: GeneratedListing }) {
  const router = useRouter();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [status, setStatus] = useState<ItemStatus>(item.status);

  const steps = useMemo<Step[]>(() => [
    {
      key: "facebook",
      title: "1. Facebook Marketplace",
      body: item.facebook,
      appHref: "fb://marketplace",
      webHref: "https://www.facebook.com/marketplace/create/item",
      copyLabel: "Copy Facebook listing",
    },
    {
      key: "offerup",
      title: "2. OfferUp",
      body: item.offerup,
      appHref: "offerup://",
      webHref: "https://offerup.com/",
      copyLabel: "Copy OfferUp listing",
    },
    {
      key: "nextdoor",
      title: "3. Nextdoor",
      body: item.nextdoor,
      appHref: "nextdoor://",
      webHref: "https://nextdoor.com/for_sale_and_free/",
      copyLabel: "Copy Nextdoor listing",
    },
  ], [item.facebook, item.offerup, item.nextdoor]);

  async function handleCopy(text: string, key: string) {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey((current) => (current === key ? null : current)), 1400);
  }

  function setPosted(nextStatus: ItemStatus) {
    updateItemStatus(item.id, nextStatus);
    setStatus(nextStatus);
    router.refresh();
  }

  return (
    <div className="card stack mobile-flow">
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div className="badge">Phone-first quick post</div>
          <div className="muted small">Copy once, jump into each app, paste, then come back for the next step.</div>
        </div>
        <div className={`status-pill status-${status}`}>{status}</div>
      </div>

      <div className="mobile-tip">
        <strong>Fastest order:</strong> Facebook → OfferUp → Nextdoor. Use the same photos and same price on all three first, then optimize later.
      </div>

      <div className="stack quick-steps">
        {steps.map((step) => (
          <div key={step.key} className="quick-step">
            <div className="quick-step-head">
              <h3>{step.title}</h3>
              <span className="mini-pill">{step.key}</span>
            </div>
            <div className="quick-actions">
              <button className="btn" type="button" onClick={() => handleCopy(step.body, step.key)}>
                {copiedKey === step.key ? "Copied" : step.copyLabel}
              </button>
              <QuickActionButton href={step.appHref} label="Open app" />
              <QuickActionButton href={step.webHref} label="Open web" />
            </div>
          </div>
        ))}
      </div>

      <div className="row">
        <button className="btn-secondary" type="button" onClick={() => setPosted("posted")}>Mark as posted</button>
        <button className="btn-secondary" type="button" onClick={() => setPosted("sold")}>Mark as sold</button>
        <button className="btn-ghost" type="button" onClick={() => setPosted("draft")}>Back to draft</button>
      </div>
    </div>
  );
}
