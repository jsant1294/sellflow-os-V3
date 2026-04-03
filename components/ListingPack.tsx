"use client";

import { useState } from "react";
import type { GeneratedListing } from "@/lib/types";
import { t } from "@/lib/i18n";
import { MobilePostFlow } from "@/components/MobilePostFlow";

function CopyButton({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false);
  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }
  return <button className="btn-secondary" type="button" onClick={handleCopy}>{copied ? "Copied" : label}</button>;
}

export function ListingPack({ item }: { item: GeneratedListing }) {
  const text = t(item.language);
  return (
    <div className="stack">
      <MobilePostFlow item={item} />
      <div className="card stack">
        <div className="badge">{text.titles}</div>
        {item.titles.map((title) => (
          <div className="list-row" key={title}>
            <div><strong>{title}</strong></div>
            <CopyButton label="Copy" text={title} />
          </div>
        ))}
      </div>

      <div className="platform">
        <h3>Facebook Marketplace</h3>
        <pre>{item.facebook}</pre>
        <CopyButton label="Copy Facebook" text={item.facebook} />
      </div>

      <div className="platform">
        <h3>OfferUp</h3>
        <pre>{item.offerup}</pre>
        <CopyButton label="Copy OfferUp" text={item.offerup} />
      </div>

      <div className="platform">
        <h3>Nextdoor</h3>
        <pre>{item.nextdoor}</pre>
        <CopyButton label="Copy Nextdoor" text={item.nextdoor} />
      </div>

      <div className="platform">
        <h3>Facebook Group Post</h3>
        <pre>{item.fbGroups}</pre>
        <CopyButton label="Copy Group Post" text={item.fbGroups} />
      </div>

      <div className="platform">
        <h3>{text.supportPost}</h3>
        <pre>{item.promoPost}</pre>
        <CopyButton label="Copy Promo Post" text={item.promoPost} />
      </div>

      <div className="card stack">
        <div className="badge">{text.replyScripts}</div>
        <div className="list-row"><div><strong>First response</strong><div className="muted">{item.replies.first}</div></div><CopyButton label="Copy" text={item.replies.first} /></div>
        <div className="list-row"><div><strong>Negotiate</strong><div className="muted">{item.replies.negotiate}</div></div><CopyButton label="Copy" text={item.replies.negotiate} /></div>
        <div className="list-row"><div><strong>Close</strong><div className="muted">{item.replies.close}</div></div><CopyButton label="Copy" text={item.replies.close} /></div>
        <div className="list-row"><div><strong>Hold response</strong><div className="muted">{item.replies.hold}</div></div><CopyButton label="Copy" text={item.replies.hold} /></div>
      </div>

      <div className="card stack">
        <div className="badge">{text.checklist}</div>
        {item.checklist.map((line) => <div className="list-row" key={line}><div>{line}</div></div>)}
      </div>

      <div className="card stack">
        <div className="badge">{text.pricing}</div>
        {item.priceAdvice.map((line) => <div className="list-row" key={line}><div>{line}</div></div>)}
      </div>

      <div className="card stack">
        <div className="badge">{text.relist}</div>
        {item.relistPlan.map((line) => <div className="list-row" key={line}><div>{line}</div></div>)}
      </div>
    </div>
  );
}
