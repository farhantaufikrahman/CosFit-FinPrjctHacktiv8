export function generateSlug(...parts: string[]) {
  return parts
    .filter(Boolean)
    .join("-")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}