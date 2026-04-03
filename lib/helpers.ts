export function currency(value: number) {
  return `$${Number.isFinite(value) ? value.toFixed(0) : "0"}`;
}

export function statusClass(status: string) {
  if (status === "posted") return "status-pill status-posted";
  if (status === "sold") return "status-pill status-sold";
  return "status-pill status-draft";
}

export function formatDate(date: string) {
  try {
    return new Date(date).toLocaleString();
  } catch {
    return date;
  }
}
