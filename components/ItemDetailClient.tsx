"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Header } from "@/components/Header";
import { LucioWidget } from "@/components/LucioWidget";
import { ListingPack } from "@/components/ListingPack";
import { readItems } from "@/lib/storage";

export function ItemDetailClient({ id }: { id: string }) {
  const item = useMemo(() => readItems().find((entry) => entry.id === id), [id]);

  if (!item) {
    return (
      <main className="shell stack">
        <Header />
        <div className="card stack">
          <strong>Item not found.</strong>
          <div className="muted">The item may not exist on this browser yet. Import your JSON backup or create it again.</div>
          <Link href="/" className="btn-secondary">Back to dashboard</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="shell stack">
      <Header lang={item.language} />
      <div>
        <Link href="/" className="btn-ghost">← Back to dashboard</Link>
      </div>
      <div className="card stack">
        <div className="badge">Full Listing Pack</div>
        <h2 style={{ margin: 0 }}>{item.itemName}</h2>
        <div className="muted">{item.category} • {item.condition} • Qty {item.quantity} • List ${item.listPrice} • Target ${item.targetPrice} • Floor ${item.floorPrice} • Lowest ${item.lowestAcceptable}</div>
      </div>
      <ListingPack item={item} />
      <LucioWidget item={item} />
    </main>
  );
}
