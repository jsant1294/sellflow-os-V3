import type { Language } from "@/lib/types";

export const copy = {
  en: {
    badge: "Local selling command center",
    title: "SellFlow OS Final V3",
    subtitle:
      "Generate sharper listings, better pricing, and faster follow-up copy for Facebook Marketplace, OfferUp, Nextdoor, and support posts.",
    addItem: "Add Item",
    dashboard: "Dashboard",
    back: "Back",
    empty: "No items yet. Add your first item and generate a full listing pack.",
    drafts: "Drafts",
    posted: "Posted",
    sold: "Sold",
    potential: "Potential value",
    export: "Export JSON",
    import: "Import JSON",
    clear: "Clear All",
    listingPack: "Listing Pack",
    fastPlan: "Fast move plan",
    supportPost: "Support post",
    titles: "Titles",
    replyScripts: "Reply Scripts",
    checklist: "Photo + posting checklist",
    pricing: "Pricing strategy",
    relist: "Relist plan",
    todayActions: "Today actions",
    setup: "Setup ready",
  },
  es: {
    badge: "Centro de mando para ventas locales",
    title: "SellFlow OS Final V3",
    subtitle:
      "Genera publicaciones más fuertes, mejor precio y respuestas rápidas para Facebook Marketplace, OfferUp, Nextdoor y publicaciones de apoyo.",
    addItem: "Agregar artículo",
    dashboard: "Panel",
    back: "Volver",
    empty: "Aún no hay artículos. Agrega el primero y genera el paquete completo.",
    drafts: "Borradores",
    posted: "Publicados",
    sold: "Vendidos",
    potential: "Valor potencial",
    export: "Exportar JSON",
    import: "Importar JSON",
    clear: "Borrar todo",
    listingPack: "Paquete de publicación",
    fastPlan: "Plan rápido",
    supportPost: "Publicación de apoyo",
    titles: "Títulos",
    replyScripts: "Guiones de respuesta",
    checklist: "Checklist de fotos + publicación",
    pricing: "Estrategia de precio",
    relist: "Plan de republicación",
    todayActions: "Acciones de hoy",
    setup: "Listo para instalar",
  },
} as const;

export function t(lang: Language) {
  return copy[lang];
}
