"use client";

import Link from "next/link";
import type { Language } from "@/lib/types";
import { t } from "@/lib/i18n";

export function Header({ lang = "en" }: { lang?: Language }) {
  const text = t(lang);
  return (
    <div className="card header">
      <div className="brand">
        <div className="badge">{text.badge}</div>
        <h1 className="title">{text.title}</h1>
        <p className="subtitle">{text.subtitle}</p>
      </div>
      <div className="actions">
        <Link href="/" className="btn-secondary">{text.dashboard}</Link>
        <Link href="/add" className="btn">{text.addItem}</Link>
      </div>
    </div>
  );
}
