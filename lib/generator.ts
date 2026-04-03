import type { GeneratedListing, ItemFormValues } from "@/lib/types";

function urgencyPhrase(urgency: ItemFormValues["urgency"], language: ItemFormValues["language"]) {
  const map = {
    en: {
      low: "available for the right buyer",
      medium: "priced fairly and ready to move",
      high: "priced for quick pickup",
    },
    es: {
      low: "disponible para el comprador correcto",
      medium: "con precio justo y listo para salir",
      high: "con precio para venta rápida",
    },
  };
  return map[language][urgency];
}

function titleSet(values: ItemFormValues) {
  if (values.language === "es") {
    return [
      `🚨 ${values.itemName} - Se va hoy`,
      `${values.itemName} en venta | Oferta local`,
      `${values.itemName} - Recogida hoy`,
    ];
  }
  return [
    `🚨 ${values.itemName} - Must Sell`,
    `${values.itemName} for Sale | Local Deal`,
    `${values.itemName} - Pickup Today`,
  ];
}

function checklist(values: ItemFormValues) {
  return values.language === "es"
    ? [
        "Toma una foto frontal limpia con buena luz.",
        "Agrega una foto de cerca mostrando marca, puertos o detalles.",
        "Incluye una foto con referencia de tamaño si aplica.",
        "Publica primero en Facebook Marketplace, luego OfferUp y Nextdoor.",
        "Responde en menos de 10 minutos para cerrar más rápido.",
      ]
    : [
        "Take one clean front photo in good light.",
        "Add one close-up showing brand, ports, texture, or details.",
        "Include a size-reference photo when relevant.",
        "Post to Facebook Marketplace first, then OfferUp and Nextdoor.",
        "Reply within 10 minutes to close faster.",
      ];
}

function priceAdvice(values: ItemFormValues) {
  return values.language === "es"
    ? [
        `Publica en ${values.listPrice} para captar atención sin regalarlo.`,
        `Si preguntan “¿último precio?”, intenta cerrar en ${values.targetPrice}.`,
        `No bajes de ${values.lowestAcceptable} salvo que quieras cierre inmediato.`,
      ]
    : [
        `List at $${values.listPrice} to attract clicks without undercutting yourself.`,
        `If buyers ask for your lowest, try to close around $${values.targetPrice}.`,
        `Do not drop below $${values.lowestAcceptable} unless you need an immediate pickup.`,
      ];
}

function relistPlan(language: ItemFormValues["language"]) {
  return language === "es"
    ? [
        "6 horas: cambia la portada o acomoda mejor las fotos.",
        "12 horas: comparte en grupos locales y actualiza el título.",
        "24 horas: baja al precio objetivo y vuelve a publicar.",
      ]
    : [
        "6 hours: improve the cover photo or reorder photos.",
        "12 hours: share into local groups and tighten the title.",
        "24 hours: drop to target price and relist.",
      ];
}

export function generateListing(values: ItemFormValues): GeneratedListing {
  const notes = values.notes.trim();
  const location = values.location.trim();
  const noteLine = notes ? (values.language === "es" ? `\nDetalles: ${notes}` : `\nNotes: ${notes}`) : "";
  const locationLine = location ? (values.language === "es" ? `\nZona de entrega: ${location}` : `\nPickup area: ${location}`) : "";
  const titles = titleSet(values);
  const urgency = urgencyPhrase(values.urgency, values.language);

  const facebook = values.language === "es"
    ? `🚨 ${values.itemName.toUpperCase()} EN VENTA 🚨\n\nCondición: ${values.condition}\nCantidad: ${values.quantity}\nPrecio publicado: $${values.listPrice}\nPrecio meta: $${values.targetPrice}\n\nArtículo ${urgency}.${noteLine}${locationLine}\n\nMándame mensaje si te interesa. Disponible hoy.`
    : `🚨 ${values.itemName.toUpperCase()} FOR SALE 🚨\n\nCondition: ${values.condition}\nQuantity: ${values.quantity}\nList price: $${values.listPrice}\nTarget price: $${values.targetPrice}\n\nThis item is ${urgency}.${noteLine}${locationLine}\n\nMessage me if interested. Available today.`;

  const offerup = values.language === "es"
    ? `${values.itemName}\nCondición: ${values.condition}\nCantidad: ${values.quantity}\n$${values.listPrice} OBO\n${urgency}.${locationLine}`
    : `${values.itemName}\nCondition: ${values.condition}\nQty: ${values.quantity}\n$${values.listPrice} OBO\n${urgency}.${locationLine}`;

  const nextdoor = values.language === "es"
    ? `Hola vecinos, estoy vendiendo ${values.quantity > 1 ? `${values.quantity} unidades de ` : ""}${values.itemName} en condición ${values.condition}. Lo tengo publicado en $${values.listPrice} y está ${urgency}.${noteLine}${locationLine}\n\nEscríbeme si te interesa.`
    : `Hi neighbors, I’m selling ${values.quantity > 1 ? `${values.quantity} units of ` : ""}${values.itemName} in ${values.condition} condition. I have it listed at $${values.listPrice} and it is ${urgency}.${noteLine}${locationLine}\n\nMessage me if interested.`;

  const fbGroups = values.language === "es"
    ? `Publicando ${values.itemName} para venta rápida. Precio $${values.listPrice}. Disponible hoy en ${location || "mi área local"}. Escríbeme si te interesa.`
    : `Posting ${values.itemName} for a quick local sale. Asking $${values.listPrice}. Available today in ${location || "my local area"}. Message me if interested.`;

  const promoPost = values.language === "es"
    ? `Nuevo artículo disponible hoy: ${values.itemName}. Precio listo para moverse en $${values.listPrice}. Si quieres entrega local rápida, escríbeme.`
    : `New item available today: ${values.itemName}. Priced to move at $${values.listPrice}. Message me for quick local pickup.`;

  const replies = values.language === "es"
    ? {
        first: `Sí, todavía está disponible. Puedo entregar hoy.`,
        negotiate: `Puedo hacerlo en $${values.targetPrice} si lo recoges hoy.`,
        close: `Perfecto — te mando la ubicación ahora.`,
        hold: `No aparto sin confirmar salida hoy, pero si vienes pronto es tuyo.`,
      }
    : {
        first: `Yes, it is still available. I can meet today.`,
        negotiate: `I can do $${values.targetPrice} if you can pick up today.`,
        close: `Perfect — sending pickup details now.`,
        hold: `I cannot hold it long without pickup, but if you can come soon it is yours.`,
      };

  return {
    ...values,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: "draft",
    titles,
    facebook,
    offerup,
    nextdoor,
    fbGroups,
    promoPost,
    replies,
    checklist: checklist(values),
    priceAdvice: priceAdvice(values),
    relistPlan: relistPlan(values.language),
  };
}
