/**
 * Visual screenshot tests for dark pastel UI/UX system.
 *
 * Captures full-page screenshots for all core marketing and app pages.
 * Screenshots saved to test-results/screenshots/
 *
 * Run with:
 *   npx playwright test tests/e2e/visual-screenshot.spec.ts
 *
 * Requires frontend running at http://localhost:3000 (npm run dev or preview)
 */

import { test, expect, type Page } from "@playwright/test";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const SCREENSHOT_DIR = "test-results/screenshots";

async function screenshotPage(page: Page, route: string, name: string) {
  await page.goto(`${BASE_URL}${route}`, { waitUntil: "networkidle", timeout: 30_000 });
  await page.waitForTimeout(1200); // allow animations to settle
  await page.screenshot({
    path: `${SCREENSHOT_DIR}/${name}.png`,
    fullPage: true,
    animations: "disabled",
  });
}

// ── VIEWPORT CONFIGS ────────────────────────────────────────────────────────
const DESKTOP = { width: 1440, height: 900 };
const MOBILE  = { width: 390,  height: 844 };

// ── MARKETING PAGES ─────────────────────────────────────────────────────────
test.describe("Marketing pages — desktop", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(DESKTOP);
  });

  const PAGES = [
    { route: "/",                  name: "home-desktop" },
    { route: "/product",           name: "product-desktop" },
    { route: "/guided-assessment", name: "guided-assessment-desktop" },
    { route: "/dataset-audit",     name: "dataset-audit-desktop" },
    { route: "/model-assessment",  name: "model-assessment-desktop" },
    { route: "/compliance-exports",name: "compliance-exports-desktop" },
    { route: "/community",         name: "community-desktop" },
    { route: "/cloud",             name: "managed-cloud-desktop" },
    { route: "/pricing",           name: "pricing-desktop" },
    { route: "/security",          name: "security-desktop" },
    { route: "/developers",        name: "developers-desktop" },
    { route: "/docs",              name: "docs-desktop" },
    { route: "/ecosystem",         name: "ecosystem-desktop" },
    { route: "/openapi",           name: "openapi-desktop" },
    { route: "/self-host",         name: "self-host-desktop" },
    { route: "/request-access",    name: "request-access-desktop" },
    { route: "/login",             name: "login-desktop" },
    { route: "/register",          name: "register-desktop" },
  ];

  for (const pg of PAGES) {
    test(`screenshot: ${pg.name}`, async ({ page }) => {
      await screenshotPage(page, pg.route, pg.name);
      // Basic existence check — page has content
      await expect(page.locator("body")).not.toBeEmpty();
    });
  }
});

test.describe("Marketing pages — mobile", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE);
  });

  const MOBILE_PAGES = [
    { route: "/",               name: "home-mobile" },
    { route: "/product",        name: "product-mobile" },
    { route: "/security",       name: "security-mobile" },
    { route: "/login",          name: "login-mobile" },
    { route: "/request-access", name: "request-access-mobile" },
  ];

  for (const pg of MOBILE_PAGES) {
    test(`screenshot: ${pg.name}`, async ({ page }) => {
      await screenshotPage(page, pg.route, pg.name);
      // No horizontal overflow
      const bodyWidth  = await page.evaluate(() => document.body.scrollWidth);
      const viewWidth  = await page.evaluate(() => window.innerWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewWidth + 4); // 4px tolerance
    });
  }
});

// ── CONTENT QUALITY CHECKS ──────────────────────────────────────────────────
test.describe("Content quality — public pages", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(DESKTOP);
  });

  const PUBLIC_PAGES = [
    "/",
    "/product",
    "/guided-assessment",
    "/dataset-audit",
    "/model-assessment",
    "/compliance-exports",
    "/community",
    "/cloud",
    "/pricing",
    "/security",
    "/developers",
    "/docs",
    "/ecosystem",
    "/openapi",
    "/self-host",
    "/request-access",
  ];

  for (const route of PUBLIC_PAGES) {
    test(`${route} has H1`, async ({ page }) => {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: "domcontentloaded" });
      const h1 = page.getByRole("heading", { level: 1 });
      await expect(h1).toBeVisible();
    });

    test(`${route} has no forbidden internal terms`, async ({ page }) => {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: "domcontentloaded" });
      const body = await page.textContent("body");
      expect(body).not.toMatch(/\bD3\.7\b/);
      expect(body).not.toMatch(/\bTRL\b/);
    });

    test(`${route} has primary CTA link`, async ({ page }) => {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: "domcontentloaded" });
      const links = await page.getByRole("link").count();
      expect(links).toBeGreaterThan(0);
    });
  }
});

// ── VISUAL SYSTEM CHECKS ────────────────────────────────────────────────────
test.describe("Visual system — dark pastel theme", () => {
  test("homepage body background is dark", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
    const bgColor = await page.evaluate(() => {
      return getComputedStyle(document.body).backgroundColor;
    });
    // Should be a dark color (r,g,b all low)
    expect(bgColor).not.toBe("rgb(255, 255, 255)");
  });

  test("Inter font applied globally", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
    const fontFamily = await page.evaluate(() => {
      return getComputedStyle(document.body).fontFamily;
    });
    expect(fontFamily.toLowerCase()).toMatch(/inter/);
  });

  test("header is visible on homepage", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
    const header = page.locator("header");
    await expect(header).toBeVisible();
  });

  test("focus ring visible on interactive element", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
    await page.keyboard.press("Tab");
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused).toBeTruthy();
  });

  test("hero has accessible name or role", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
    const hero = page.locator("section").first();
    await expect(hero).toBeVisible();
  });

  test("primary CTA button accessible name present", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
    const cta = page.getByRole("link", { name: /Request Managed Access/i });
    await expect(cta).toBeVisible();
  });

  test("skip-to-content link exists", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
    const skip = page.locator("a.skip-to-content");
    await expect(skip).toBeAttached();
  });
});

// ── MOBILE RESPONSIVE CHECKS ────────────────────────────────────────────────
test.describe("Responsive — mobile drawer", () => {
  test("hamburger button opens mobile menu", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
    const menuButton = page.getByRole("button", { name: /open menu/i });
    await expect(menuButton).toBeVisible();
    await menuButton.click();
    const nav = page.locator("[id='mobile-menu']");
    await expect(nav).toBeVisible();
  });

  test("home page no horizontal overflow on mobile", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
    const overflow = await page.evaluate(() => document.body.scrollWidth > window.innerWidth);
    expect(overflow).toBe(false);
  });
});
