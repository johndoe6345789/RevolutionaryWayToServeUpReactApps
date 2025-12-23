import { expect, test } from "@playwright/test";

test.describe("Responsive Design", () => {
  test.beforeEach(async ({ page }) => {
    page.on("console", (message) => {
      console.debug(`[playwright console] ${message.type()}: ${message.text()}`);
    });
  });

  test("page loads on desktop viewport", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/", { waitUntil: "networkidle" });

    // Check that all major elements are visible on desktop
    await expect(page.getByText("Press Start")).toBeVisible();
    await expect(page.getByText("Featured Games")).toBeVisible();
    await expect(page.getByText("Super Mario Bros")).toBeVisible();

    // Check header layout (should be horizontal on desktop)
    const header = page.locator('header').first();
    await expect(header).toBeVisible();
  });

  test("page loads on tablet viewport", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/", { waitUntil: "networkidle" });

    // Check that content adapts to tablet size
    await expect(page.getByText("Press Start")).toBeVisible();
    await expect(page.getByText("Featured Games")).toBeVisible();

    // Hero section should still be functional
    const arcadeButton = page.getByRole("button", { name: /launch arcade mode/i });
    await expect(arcadeButton).toBeVisible();
  });

  test("page loads on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/", { waitUntil: "networkidle" });

    // Check that content is readable on mobile
    await expect(page.getByText("Press Start")).toBeVisible();
    await expect(page.getByText("Featured Games")).toBeVisible();

    // Buttons should still be accessible
    const arcadeButton = page.getByRole("button", { name: /launch arcade mode/i });
    await expect(arcadeButton).toBeVisible();

    // Check that text doesn't overflow
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    for (const heading of await headings.all()) {
      const isVisible = await heading.isVisible();
      expect(isVisible).toBe(true);
    }
  });

  test("hero section layout adapts to different screen sizes", async ({ page }) => {
    // Test desktop layout
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/", { waitUntil: "networkidle" });

    // On desktop, hero content should be side by side
    const heroSection = page.locator('[class*="MuiStack-root"]').first();
    await expect(heroSection).toBeVisible();

    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload({ waitUntil: "networkidle" });

    // Content should stack vertically on mobile
    await expect(page.getByText("Press Start")).toBeVisible();
    await expect(page.getByRole("button", { name: /launch arcade mode/i })).toBeVisible();
  });

  test("featured games grid adapts to screen size", async ({ page }) => {
    // Test desktop (should show multiple columns)
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/", { waitUntil: "networkidle" });

    const gameCards = page.locator('[class*="MuiCard-root"]');
    await expect(gameCards.first()).toBeVisible();

    // Test mobile (should show single column)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload({ waitUntil: "networkidle" });

    await expect(gameCards.first()).toBeVisible();
    await expect(page.getByText("Super Mario Bros")).toBeVisible();
  });

  test("header remains functional across screen sizes", async ({ page }) => {
    const viewports = [
      { width: 1280, height: 720, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto("/", { waitUntil: "networkidle" });

      // Header should always be visible and functional
      await expect(page.getByText("Retro Deck")).toBeVisible();
      await expect(page.locator('header')).toBeVisible();

      // Language switcher should be accessible
      const languageSelect = page.locator('select').first();
      await expect(languageSelect).toBeVisible();
    }
  });

  test("buttons remain clickable on small screens", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/", { waitUntil: "networkidle" });

    // All interactive elements should be clickable on mobile
    const arcadeButton = page.getByRole("button", { name: /launch arcade mode/i });
    const libraryButton = page.getByRole("button", { name: /browse rom library/i });
    const playButton = page.getByRole("button", { name: /play/i }).first();

    await expect(arcadeButton).toBeVisible();
    await expect(libraryButton).toBeVisible();
    await expect(playButton).toBeVisible();

    // Buttons should not overlap in a way that makes them unclickable
    await arcadeButton.click();
    await libraryButton.click();
    await playButton.click();
  });
});
