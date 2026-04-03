"use client";

import type { Language } from "@/lib/types";

export function LanguageToggle({ value, onChange }: { value: Language; onChange: (lang: Language) => void }) {
  return (
    <div className="segmented" role="tablist" aria-label="Language toggle">
      <button type="button" className={`chip ${value === "en" ? "active" : ""}`} onClick={() => onChange("en")}>EN</button>
      <button type="button" className={`chip ${value === "es" ? "active" : ""}`} onClick={() => onChange("es")}>ES</button>
    </div>
  );
}
