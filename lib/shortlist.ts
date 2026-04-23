const KEY = "cardekho:shortlist";

export function getShortlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export function toggleShortlist(id: string): boolean {
  const current = getShortlist();
  const exists = current.includes(id);
  const next = exists ? current.filter((x) => x !== id) : [...current, id];
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("shortlist:changed"));
  return !exists;
}

export function isShortlisted(id: string): boolean {
  return getShortlist().includes(id);
}

export function clearShortlist() {
  localStorage.setItem(KEY, JSON.stringify([]));
  window.dispatchEvent(new Event("shortlist:changed"));
}
