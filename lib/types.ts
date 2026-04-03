export type ItemStatus = "draft" | "posted" | "sold";
export type Language = "en" | "es";
export type Urgency = "low" | "medium" | "high";
export type Category =
  | "electronics"
  | "decor"
  | "collectibles"
  | "tools"
  | "toys"
  | "furniture"
  | "appliances"
  | "fashion"
  | "misc";

export type ItemFormValues = {
  itemName: string;
  category: Category;
  condition: "new" | "like new" | "good" | "fair";
  urgency: Urgency;
  notes: string;
  location: string;
  quantity: number;
  listPrice: number;
  targetPrice: number;
  floorPrice: number;
  lowestAcceptable: number;
  language: Language;
};

export type GeneratedListing = ItemFormValues & {
  id: string;
  createdAt: string;
  status: ItemStatus;
  titles: string[];
  facebook: string;
  offerup: string;
  nextdoor: string;
  fbGroups: string;
  promoPost: string;
  replies: {
    first: string;
    negotiate: string;
    close: string;
    hold: string;
  };
  checklist: string[];
  priceAdvice: string[];
  relistPlan: string[];
};
