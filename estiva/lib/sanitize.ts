/**
 * Sanitize a string to prevent XSS when used in non-React contexts.
 * React already escapes JSX expressions, but this is useful for:
 * - dangerouslySetInnerHTML (should be avoided)
 * - Dynamic attribute values
 * - Values passed to third-party libraries
 */
const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
};

const ENTITY_RE = /[&<>"'/]/g;

export function escapeHtml(str: string): string {
  return str.replace(ENTITY_RE, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Strip HTML tags from a string.
 */
export function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, "");
}

/**
 * Sanitize user input before sending to API.
 * Trims whitespace and removes null bytes.
 */
export function sanitizeInput(value: string): string {
  return value.trim().replace(/\0/g, "");
}

/**
 * Validate and sanitize a URL to prevent javascript: protocol attacks.
 * Returns the URL if safe, or empty string if potentially malicious.
 */
export function sanitizeUrl(url: string): string {
  const trimmed = url.trim();
  if (
    trimmed.startsWith("javascript:") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("vbscript:")
  ) {
    return "";
  }
  return trimmed;
}
