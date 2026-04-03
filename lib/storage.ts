import type { GeneratedListing, ItemStatus } from "@/lib/types";

const STORAGE_KEY = "sellflow-final-items";

export function readItems(): GeneratedListing[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as GeneratedListing[]) : [];
  } catch {
    return [];
  }
}

export function writeItems(items: GeneratedListing[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function addItem(item: GeneratedListing) {
  const items = readItems();
  const updated = [item, ...items];
  writeItems(updated);
  return updated;
}

export function updateItemStatus(id: string, status: ItemStatus) {
  const items = readItems().map((item) => (item.id === id ? { ...item, status } : item));
  writeItems(items);
  return items;
}

export function removeAllItems() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function exportItems() {
  const data = JSON.stringify(readItems(), null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "sellflow-items.json";
  link.click();
  URL.revokeObjectURL(url);
}

export function importItemsFromFile(file: File): Promise<GeneratedListing[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as GeneratedListing[];
        writeItems(parsed);
        resolve(parsed);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
