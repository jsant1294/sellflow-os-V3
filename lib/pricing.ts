import type { Category, ItemFormValues, Urgency } from "@/lib/types";

const categoryBase: Record<Category, number> = {
  electronics: 150,
  decor: 75,
  collectibles: 95,
  tools: 140,
  toys: 55,
  furniture: 130,
  appliances: 170,
  fashion: 50,
  misc: 60,
};

const conditionMultiplier: Record<ItemFormValues["condition"], number> = {
  "new": 1.12,
  "like new": 1,
  "good": 0.84,
  "fair": 0.62,
};

const urgencyAdjustment: Record<Urgency, number> = {
  low: 1,
  medium: 0.92,
  high: 0.82,
};

const quantityFactor = (quantity: number) => (quantity > 1 ? Math.min(1 + quantity * 0.12, 1.8) : 1);
const roundToFive = (value: number) => Math.max(5, Math.round(value / 5) * 5);

export function getSuggestedPricing(values: Pick<ItemFormValues, "category" | "condition" | "urgency" | "quantity">) {
  const base = categoryBase[values.category] ?? categoryBase.misc;
  const listPrice = roundToFive(base * conditionMultiplier[values.condition] * quantityFactor(values.quantity));
  const targetPrice = roundToFive(listPrice * urgencyAdjustment[values.urgency]);
  const floorPrice = roundToFive(targetPrice * 0.84);
  const lowestAcceptable = roundToFive(floorPrice * 0.95);

  return { listPrice, targetPrice, floorPrice, lowestAcceptable };
}
