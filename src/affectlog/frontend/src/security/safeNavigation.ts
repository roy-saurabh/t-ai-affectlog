/**
 * Same-origin navigation guard (CWE-601).
 *
 * Router destinations that are not compile-time constants are normalised here
 * before they reach `navigate()` or `<Navigate to=...>`. The post-authentication
 * destination is currently the only such value: it is carried in router state by
 * the route guards and replayed after sign-in.
 *
 * This is an application-level control and is deliberately independent of the
 * router version in use. It holds even if a future router release re-introduces
 * permissive handling of protocol-relative or backslash-bearing paths
 * (see GHSA-jjmj-jmhj-qwj2 / CVE-2026-53668).
 *
 * Only a path *within this application* is ever returned; anything else falls
 * back to a fixed internal route.
 */

/** Characters that must never appear in an internal destination. */
// eslint-disable-next-line no-control-regex
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/;

/**
 * Reject values that are structurally unsafe before any URL parsing happens.
 *
 * Backslashes are rejected outright because browsers normalise `\` to `/` in
 * URL paths, so `/\evil.example` and `/%5Cevil.example` are both routes to a
 * protocol-relative destination.
 */
function isStructurallyUnsafe(value: string): boolean {
  if (!value.startsWith("/")) return true;
  if (value.startsWith("//")) return true;
  if (value.includes("\\")) return true;
  return CONTROL_CHARACTERS.test(value);
}

/**
 * Decode percent-escapes so that encoded forms of the rejected shapes above are
 * caught too. A malformed escape sequence is itself treated as unsafe.
 */
function decodesToUnsafeValue(value: string): boolean {
  let decoded = value;
  // Two passes catch double-encoded payloads such as `%252f%252fevil.example`.
  for (let pass = 0; pass < 2; pass += 1) {
    let next: string;
    try {
      next = decodeURIComponent(decoded);
    } catch {
      return true;
    }
    if (next === decoded) break;
    decoded = next;
    if (isStructurallyUnsafe(decoded)) return true;
  }
  return false;
}

/**
 * Resolve `candidate` to a destination that is guaranteed to stay on the
 * application's own origin.
 *
 * @param candidate  Untrusted destination, typically replayed router state.
 * @param fallback   Fixed internal route used when `candidate` is not safe.
 * @param origin     Application origin; defaults to the current document origin.
 * @returns `pathname + search + hash`, or `fallback`.
 */
export function safeInternalDestination(
  candidate: unknown,
  fallback: string,
  origin: string = typeof window === "undefined" ? "" : window.location.origin,
): string {
  if (typeof candidate !== "string") return fallback;
  if (candidate.length === 0) return fallback;
  if (isStructurallyUnsafe(candidate)) return fallback;
  if (decodesToUnsafeValue(candidate)) return fallback;

  // Resolve against the application origin and require the origin to survive.
  // This rejects anything that parsing re-interprets as an absolute URL.
  let resolved: URL;
  try {
    resolved = new URL(candidate, origin);
  } catch {
    return fallback;
  }
  if (resolved.origin !== origin) return fallback;

  return `${resolved.pathname}${resolved.search}${resolved.hash}`;
}
