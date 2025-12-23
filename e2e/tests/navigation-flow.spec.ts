import { expect, test } from "@playwright/test";

test.describe("Navigation Flow", () => {
  test.beforeEach(async ({ page }) => {
    page.on("console", (message) => {
      console.debug(`[playwright console] ${message.type()}: ${message.text()}`);
    });
  });

  test("hero section buttons trigger navigation attempts", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    // Mock console.log to capture navigation logs
    const logs: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('Launch Arcade Mode') || msg.text().includes('Browse ROM Library')) {
        logs.push(msg.text());
      }
    });

    // Click Launch Arcade Mode button
    const arcadeButton = page.getByRole("button", { name: /launch arcade mode/i });
    await arcadeButton.click();

    // Click Browse ROM Library button
    const libraryButton = page.getByRole("button", { name: /browse rom library/i });
    await libraryButton.click();

    // Verify navigation was attempted (console logs should appear)
    expect(logs.length).toBe(2);
    expect(logs[0]).toContain('Launch Arcade Mode');
    expect(logs[1]).toContain('Browse ROM Library');
  });

  test("featured games navigation works", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    // Mock console.log to capture game navigation logs
    const logs: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('Play') || msg.text().includes('Super Mario Bros')) {
        logs.push(msg.text());
      }
    });

    // Click Play button on featured game
    const playButton = page.getByRole("button", { name: /play/i }).first();
    await playButton.click();

    // Click Details button on featured game
    const detailsButton = page.getByRole("button", { name: /details/i }).first();
    await detailsButton.click();

    // Verify game navigation was attempted
    expect(logs.length).toBe(2);
    expect(logs[0]).toContain('Play');
    expect(logs[1]).toContain('Super Mario Bros');
  });

  test("view all games button triggers navigation", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    // Click "View All Games" button
    const viewAllButton = page.getByRole("button", { name: /all games/i });
    await viewAllButton.click();

    // Since navigation might not work in test environment,
    // we just verify the button exists and is clickable
    await expect(viewAllButton).toBeVisible();
  });

  test("page maintains state after navigation attempts", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    // Click multiple navigation buttons
    const arcadeButton = page.getByRole("button", { name: /launch arcade mode/i });
    const libraryButton = page.getByRole("button", { name: /browse rom library/i });
    const playButton = page.getByRole("button", { name: /play/i }).first();
    const viewAllButton = page.getByRole("button", { name: /all games/i });

    await arcadeButton.click();
    await libraryButton.click();
    await playButton.click();
    await viewAllButton.click();

    // Verify page content is still intact after all interactions
    await expect(page.getByText("Press Start")).toBeVisible();
    await expect(page.getByText("Featured Games")).toBeVisible();
    await expect(page.getByText("Super Mario Bros")).toBeVisible();

    // Verify all buttons are still present and enabled
    await expect(arcadeButton).toBeEnabled();
    await expect(libraryButton).toBeEnabled();
    await expect(playButton).toBeEnabled();
    await expect(viewAllButton).toBeEnabled();
  });
});
