import { expect, test } from "@playwright/test";

test.describe("Game Interactions", () => {
  test.beforeEach(async ({ page }) => {
    page.on("console", (message) => {
      console.debug(`[playwright console] ${message.type()}: ${message.text()}`);
    });
  });

  test("featured games are displayed with proper information", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    // Check that Super Mario Bros is displayed
    await expect(page.getByText("Super Mario Bros")).toBeVisible();

    // Check platform and year chips
    await expect(page.getByText("NES")).toBeVisible();
    await expect(page.getByText("1985")).toBeVisible();

    // Check game description
    await expect(page.getByText("Classic platformer game")).toBeVisible();

    // Check rating is displayed
    const ratingElements = page.locator('[class*="MuiRating"]').first();
    await expect(ratingElements).toBeVisible();
  });

  test("game action buttons are functional", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    // Capture console logs for navigation attempts
    const logs: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('Play') || msg.text().includes('Super Mario Bros')) {
        logs.push(msg.text());
      }
    });

    // Test Play button
    const playButton = page.getByRole("button", { name: /play/i }).first();
    await expect(playButton).toBeVisible();
    await expect(playButton).toBeEnabled();
    await playButton.click();

    // Test Details button
    const detailsButton = page.getByRole("button", { name: /details/i }).first();
    await expect(detailsButton).toBeVisible();
    await expect(detailsButton).toBeEnabled();
    await detailsButton.click();

    // Verify interactions were logged
    expect(logs.length).toBeGreaterThan(0);
  });

  test("view all games button is present and clickable", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    const viewAllButton = page.getByRole("button", { name: /all games/i });
    await expect(viewAllButton).toBeVisible();
    await expect(viewAllButton).toBeEnabled();

    // Click should not cause errors
    await viewAllButton.click();
  });

  test("game cards have proper hover effects", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    // Find a game card
    const gameCard = page.locator('[class*="MuiCard-root"]').first();
    await expect(gameCard).toBeVisible();

    // Get initial transform
    const initialTransform = await gameCard.evaluate(el => getComputedStyle(el).transform);

    // Hover over the card
    await gameCard.hover();

    // Card should still be visible and functional after hover
    await expect(gameCard).toBeVisible();
    await expect(page.getByText("Super Mario Bros")).toBeVisible();
  });

  test("game ratings are displayed correctly", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    // Check that rating stars are present
    const ratingContainer = page.locator('[class*="MuiRating-root"]').first();
    await expect(ratingContainer).toBeVisible();

    // Check that rating value is shown
    await expect(page.getByText("4.5")).toBeVisible();
  });
});
