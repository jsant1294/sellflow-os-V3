export type ItemStatus = "draft" | "posted" | "sold";
export type Language = "en" | "es";
export type Urgency = "low" | "medium" | "high";
export type Condition = "new" | "like new" | "good" | "fair";
export type LucioMode = "price" | "improve" | "reply" | "faster";
export type LucioPlatform = "facebook" | "offerup" | "nextdoor" | "general";
export type LucioGoal = "fast_cash" | "max_profit";
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
  condition: Condition;
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

export type QuickScanAnalysis = {
  itemName: string;
  category: Category;
  condition: Condition;
  notes: string;
  quantity: number;
  pricing: {
    fast: number;
    target: number;
    max: number;
    lowestAcceptable: number;
  };
};

export type LucioContextItem = {
  name: string;
  category: Category;
  condition: Condition;
  notes: string;
  urgency: Urgency;
};

export type LucioListingState = {
  status: ItemStatus;
  ageHours: number;
  isStale: boolean;
  summary: string;
};

export type LucioRequestPayload = {
  mode: LucioMode;
  platform: LucioPlatform;
  goal: LucioGoal;
  buyerMessage?: string;
  draftText?: string;
  generatedText?: string;
  item?: LucioContextItem;
  listingState?: LucioListingState;
  pricing?: {
    list: number;
    target: number;
    floor: number;
    lowestAcceptable: number;
  };
};

export type LucioResponseCard = {
  title: string;
  body: string;
  copyText: string;
};

export type LucioResponsePayload = {
  headline: string;
  cards: LucioResponseCard[];
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
