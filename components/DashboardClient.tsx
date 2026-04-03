"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { Header } from "@/components/Header";
import { LucioWidget } from "@/components/LucioWidget";
import { LanguageToggle } from "@/components/LanguageToggle";
import { t } from "@/lib/i18n";
import { currency, formatDate, statusClass } from "@/lib/helpers";
import { exportItems, importItemsFromFile, readItems, removeAllItems, updateItemStatus } from "@/lib/storage";
import type { GeneratedListing, ItemStatus, Language } from "@/lib/types";

export function DashboardClient() {
  const [lang, setLang] = useState<Language>("en");
  const [items, setItems] = useState<GeneratedListing[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const text = t(lang);

  useEffect(() => {
    setItems(readItems());
  }, []);

  function handleStatus(id: string, status: ItemStatus) {
    setItems(updateItemStatus(id, status));
  }

  async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const imported = await importItemsFromFile(file);
    setItems(imported);
    event.target.value = "";
  }

  function handleClear() {
    removeAllItems();
    setItems([]);
  }

  const summary = useMemo(() => {
    const drafts = items.filter((item) => item.status === "draft").length;
    const posted = items.filter((item) => item.status === "posted").length;
    const sold = items.filter((item) => item.status === "sold").length;
    const potential = items.filter((item) => item.status !== "sold").reduce((sum, item) => sum + item.targetPrice, 0);
    return { drafts, posted, sold, potential };
  }, [items]);

  return (
    <main className="shell stack">
      <Header lang={lang} />

      <div className="card row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <div className="stack" style={{ gap: 8 }}>
          <div className="badge">{text.setup}</div>
          <div className="muted small">DIY install ready. Use it yourself first, then package it as a download or setup service.</div>
        </div>
        <LanguageToggle value={lang} onChange={setLang} />
      </div>

      <div className="grid grid-4">
        <div className="kpi"><div className="kpi-label">{text.drafts}</div><div className="kpi-value">{summary.drafts}</div><div className="kpi-note">Waiting to post</div></div>
        <div className="kpi"><div className="kpi-label">{text.posted}</div><div className="kpi-value">{summary.posted}</div><div className="kpi-note">Active listings</div></div>
        <div className="kpi"><div className="kpi-label">{text.sold}</div><div className="kpi-value">{summary.sold}</div><div className="kpi-note">Closed items</div></div>
        <div className="kpi"><div className="kpi-label">{text.potential}</div><div className="kpi-value">{currency(summary.potential)}</div><div className="kpi-note">Open target value</div></div>
      </div>

      <div className="card row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <div className="actions">
          <Link href="/add" className="btn">{text.addItem}</Link>
          <button type="button" className="btn-secondary" onClick={() => exportItems()}>{text.export}</button>
          <button type="button" className="btn-secondary" onClick={() => fileInputRef.current?.click()}>{text.import}</button>
          <button type="button" className="btn-ghost" onClick={handleClear}>{text.clear}</button>
          <input ref={fileInputRef} type="file" accept="application/json" hidden onChange={handleImport} />
        </div>
        <div className="muted small">{text.todayActions}: post drafts, answer fast, drop to target after 24h if needed.</div>
      </div>

      {items.length === 0 ? (
        <EmptyState message={text.empty} />
      ) : (
        <div className="grid">
          {items.map((item) => (
            <div key={item.id} className="item-card">
              <div className="item-head">
                <div className="stack" style={{ gap: 8 }}>
                  <div className={statusClass(item.status)}>{item.status}</div>
                  <div>
                    <strong>{item.itemName}</strong>
                    <div className="item-meta">{item.category} • {item.condition} • Qty {item.quantity} • {formatDate(item.createdAt)}</div>
                  </div>
                </div>
                <div className="item-meta">List ${item.listPrice} • Target ${item.targetPrice} • Floor ${item.floorPrice}</div>
              </div>

              <div className="muted small">{item.notes || "No notes added."}</div>

              <div className="actions">
                <Link href={`/item/${item.id}`} className="btn-secondary">Open pack</Link>
                <button type="button" className={`status-btn ${item.status === "draft" ? "active" : ""}`} onClick={() => handleStatus(item.id, "draft")}>Draft</button>
                <button type="button" className={`status-btn ${item.status === "posted" ? "active" : ""}`} onClick={() => handleStatus(item.id, "posted")}>Posted</button>
                <button type="button" className={`status-btn ${item.status === "sold" ? "active" : ""}`} onClick={() => handleStatus(item.id, "sold")}>Sold</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <LucioWidget />
    </main>
  );
}
