import { describe, expect, it } from "vitest";
import { safeInternalDestination } from "./safeNavigation";

const ORIGIN = "https://app.example";
const FALLBACK = "/app";

/** Resolve against a fixed origin so the test does not depend on a DOM. */
const resolve = (candidate: unknown) => safeInternalDestination(candidate, FALLBACK, ORIGIN);

describe("safeInternalDestination", () => {
  it("accepts plain internal routes", () => {
    expect(resolve("/app")).toBe("/app");
    expect(resolve("/app/datasets")).toBe("/app/datasets");
  });

  it("preserves search and hash of an internal route", () => {
    expect(resolve("/app/audit?run=123")).toBe("/app/audit?run=123");
    expect(resolve("/app/wizard#step-2")).toBe("/app/wizard#step-2");
    expect(resolve("/app/audit?run=123#top")).toBe("/app/audit?run=123#top");
  });

  it("rejects absolute external URLs", () => {
    expect(resolve("https://attacker.example/")).toBe(FALLBACK);
    expect(resolve("http://attacker.example/")).toBe(FALLBACK);
  });

  it("rejects non-http schemes", () => {
    expect(resolve("javascript:alert(1)")).toBe(FALLBACK);
    expect(resolve("data:text/html,<script>alert(1)</script>")).toBe(FALLBACK);
  });

  it("rejects protocol-relative paths", () => {
    expect(resolve("//attacker.example/")).toBe(FALLBACK);
    expect(resolve("///attacker.example")).toBe(FALLBACK);
  });

  it("rejects backslash-bearing paths", () => {
    expect(resolve("\\\\attacker.example\\")).toBe(FALLBACK);
    expect(resolve("/\\attacker.example")).toBe(FALLBACK);
  });

  it("rejects encoded protocol-relative and backslash payloads", () => {
    expect(resolve("%2f%2fattacker.example")).toBe(FALLBACK);
    expect(resolve("/%5cattacker.example")).toBe(FALLBACK);
    expect(resolve("/%2f%2fattacker.example")).toBe(FALLBACK);
  });

  it("rejects double-encoded payloads", () => {
    expect(resolve("/%252f%252fattacker.example")).toBe(FALLBACK);
  });

  it("rejects malformed percent-escapes", () => {
    expect(resolve("/app/%E0%A4%A")).toBe(FALLBACK);
  });

  it("rejects control characters", () => {
    expect(resolve("/app\u0000/datasets")).toBe(FALLBACK);
    expect(resolve("/app\u001f")).toBe(FALLBACK);
    expect(resolve("/app\u007f")).toBe(FALLBACK);
    expect(resolve("/java\nscript:alert(1)")).toBe(FALLBACK);
  });

  it("rejects empty and non-string values", () => {
    expect(resolve("")).toBe(FALLBACK);
    expect(resolve(undefined)).toBe(FALLBACK);
    expect(resolve(null)).toBe(FALLBACK);
    expect(resolve(42)).toBe(FALLBACK);
    expect(resolve({ pathname: "/app" })).toBe(FALLBACK);
  });

  it("rejects relative paths that do not start with a slash", () => {
    expect(resolve("app/datasets")).toBe(FALLBACK);
    expect(resolve("../admin")).toBe(FALLBACK);
  });

  it("never returns a destination on another origin", () => {
    const candidates = [
      "https://attacker.example/app",
      "//attacker.example/app",
      "/\\attacker.example",
      "%2f%2fattacker.example",
    ];
    for (const candidate of candidates) {
      const result = safeInternalDestination(candidate, FALLBACK, ORIGIN);
      expect(new URL(result, ORIGIN).origin).toBe(ORIGIN);
    }
  });
});
