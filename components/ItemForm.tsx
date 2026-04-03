"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LanguageToggle } from "@/components/LanguageToggle";
import { generateListing } from "@/lib/generator";
import { getSuggestedPricing } from "@/lib/pricing";
import { addItem } from "@/lib/storage";
import type { Category, ItemFormValues } from "@/lib/types";

const categoryOptions: { value: Category; label: string }[] = [
  { value: "electronics", label: "Electronics" },
  { value: "decor", label: "Decor" },
  { value: "collectibles", label: "Collectibles" },
  { value: "tools", label: "Tools" },
  { value: "toys", label: "Toys" },
  { value: "furniture", label: "Furniture" },
  { value: "appliances", label: "Appliances" },
  { value: "fashion", label: "Fashion" },
  { value: "misc", label: "Misc" },
];

export function ItemForm() {
  const router = useRouter();
  const [values, setValues] = useState<ItemFormValues>({
    itemName: "",
    category: "misc",
    condition: "good",
    urgency: "high",
    notes: "",
    location: "Alpharetta, GA",
    quantity: 1,
    listPrice: 0,
    targetPrice: 0,
    floorPrice: 0,
    lowestAcceptable: 0,
    language: "en",
  });

  const suggestions = useMemo(
    () => getSuggestedPricing({
      category: values.category,
      condition: values.condition,
      urgency: values.urgency,
      quantity: values.quantity,
    }),
    [values.category, values.condition, values.urgency, values.quantity]
  );

  function update<K extends keyof ItemFormValues>(key: K, value: ItemFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function applySuggestedPricing() {
    setValues((current) => ({ ...current, ...suggestions }));
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const pricing = values.listPrice > 0 ? values : { ...values, ...suggestions };
    const listing = generateListing(pricing);
    addItem(listing);
    router.push(`/item/${listing.id}`);
  }

  return (
    <form className="card stack" onSubmit={onSubmit}>
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div className="badge">Final Build Intake</div>
          <div className="muted small">Generate a full quick-sale pack with titles, pricing, replies, and relist guidance.</div>
        </div>
        <LanguageToggle value={values.language} onChange={(language) => update("language", language)} />
      </div>

      <div className="form-grid">
        <div className="field full">
          <label htmlFor="itemName">Item name</label>
          <input id="itemName" value={values.itemName} onChange={(e) => update("itemName", e.target.value)} placeholder="Netgear Nighthawk AX8 modem router" required />
        </div>

        <div className="field">
          <label htmlFor="category">Category</label>
          <select id="category" value={values.category} onChange={(e) => update("category", e.target.value as Category)}>
            {categoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </div>

        <div className="field">
          <label htmlFor="condition">Condition</label>
          <select id="condition" value={values.condition} onChange={(e) => update("condition", e.target.value as ItemFormValues["condition"])}>
            <option value="new">New</option>
            <option value="like new">Like new</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="quantity">Quantity</label>
          <input id="quantity" type="number" min="1" value={values.quantity} onChange={(e) => update("quantity", Number(e.target.value) || 1)} />
        </div>

        <div className="field">
          <label htmlFor="urgency">Urgency</label>
          <select id="urgency" value={values.urgency} onChange={(e) => update("urgency", e.target.value as ItemFormValues["urgency"])}>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="location">Pickup area</label>
          <input id="location" value={values.location} onChange={(e) => update("location", e.target.value)} placeholder="Alpharetta, GA" />
        </div>

        <div className="field full">
          <label htmlFor="notes">Notes</label>
          <textarea id="notes" value={values.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Brand, features, defects, included accessories, measurements, or bundle notes" />
        </div>

        <div className="field">
          <label htmlFor="listPrice">List price</label>
          <input id="listPrice" type="number" min="0" value={values.listPrice} onChange={(e) => update("listPrice", Number(e.target.value))} />
        </div>

        <div className="field">
          <label htmlFor="targetPrice">Target price</label>
          <input id="targetPrice" type="number" min="0" value={values.targetPrice} onChange={(e) => update("targetPrice", Number(e.target.value))} />
        </div>

        <div className="field">
          <label htmlFor="floorPrice">Floor price</label>
          <input id="floorPrice" type="number" min="0" value={values.floorPrice} onChange={(e) => update("floorPrice", Number(e.target.value))} />
        </div>

        <div className="field">
          <label htmlFor="lowestAcceptable">Lowest acceptable</label>
          <input id="lowestAcceptable" type="number" min="0" value={values.lowestAcceptable} onChange={(e) => update("lowestAcceptable", Number(e.target.value))} />
        </div>
      </div>

      <div className="list-row">
        <div>
          <strong>Suggested pricing</strong>
          <div className="muted">List ${suggestions.listPrice} • Target ${suggestions.targetPrice} • Floor ${suggestions.floorPrice} • Lowest ${suggestions.lowestAcceptable}</div>
        </div>
        <button type="button" className="btn-secondary" onClick={applySuggestedPricing}>Apply suggested pricing</button>
      </div>

      <div className="actions">
        <button className="btn" type="submit">Generate final listing pack</button>
      </div>
    </form>
  );
}
