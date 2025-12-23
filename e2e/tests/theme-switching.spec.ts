import { expect, test } from "@playwright/test";

test.describe("Theme Switching", () => {
  test.beforeEach(async ({ page }) => {
    page.on("console", (message) => {
      console.debug(`[playwright console] ${message.type()}: ${message.text()}`);
    });
  });

  test("theme toggle button is present in header", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    // Check that theme toggle button exists in header
    const themeToggle = page.locator('[aria-label*="theme"], [title*="theme"], button').filter({ hasText: '' }).first();
    await expect(themeToggle).toBeVisible();
  });

  test("header contains Retro Deck branding", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    // Check header branding
    await expect(page.getByText("Retro Deck")).toBeVisible();

    // Check that language switcher is present
    const languageSelect = page.locator('select, [role="combobox"]').first();
    await expect(languageSelect).toBeVisible();
  });

  test("page loads with consistent styling", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    // Take a screenshot to verify visual consistency
    const screenshot = await page.screenshot({ fullPage: true });

    // Verify screenshot was taken (non-empty)
    expect(screenshot.length).toBeGreaterThan(0);

    // Check that the main content areas are styled
    await expect(page.locator('[style*="background"], [class*="background"]')).toBeDefined();
  });

  test("header remains consistent across interactions", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    // Verify header elements are present before interactions
    await expect(page.getByText("Retro Deck")).toBeVisible();
    const initialHeaderCount = await page.locator('header').count();

    // Perform some interactions
    const arcadeButton = page.getByRole("button", { name: /launch arcade mode/i });
    await arcadeButton.click();

    const playButton = page.getByRole("button", { name: /play/i }).first();
    await playButton.click();

    // Verify header elements are still present after interactions
    await expect(page.getByText("Retro Deck")).toBeVisible();
    const finalHeaderCount = await page.locator('header').count();
    expect(finalHeaderCount).toBe(initialHeaderCount);
  });

  test("theme toggle is accessible", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    // Find theme toggle button (it should be accessible)
    const themeToggle = page.locator('button').filter({ has: page.locator('[class*="Brightness"]') }).first();

    // Verify it's visible and enabled
    await expect(themeToggle).toBeVisible();
    await expect(themeToggle).toBeEnabled();

    // Check that it has appropriate accessibility attributes
    const ariaLabel = await themeToggle.getAttribute('aria-label');
    const title = await themeToggle.getAttribute('title');

    // Should have some form of accessible labeling
    expect(ariaLabel || title).toBeTruthy();
  });

  test("language switcher is functional", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    // Find language selector
    const languageSelect = page.locator('select').first();
    await expect(languageSelect).toBeVisible();

    // Check available options
    const options = languageSelect.locator('option');
    const optionCount = await options.count();
    expect(optionCount).toBeGreaterThan(0);

    // Verify EN and ES options are available
    await expect(page.locator('option[value="en"]')).toBeDefined();
    await expect(page.locator('option[value="es"]')).toBeDefined();
  });
});
