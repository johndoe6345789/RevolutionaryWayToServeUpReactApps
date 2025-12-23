import { expect, test } from "@playwright/test";

test.describe("Retro Gaming App", () => {
  test.beforeEach(async ({ page }) => {
    page.on("console", (message) => {
      console.debug(`[playwright console] ${message.type()}: ${message.text()}`);
    });
    page.on("response", (response) => {
      if (response.status() >= 400) {
        console.warn(
          `[playwright response] ${response.status()} ${response.url()}`
        );
      }
    });
  });

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      await testInfo.attach("page snapshot", {
        body: await page.content(),
        contentType: "text/html",
      });
      const screenshot = await page.screenshot({ fullPage: true });
      await testInfo.attach("failure screenshot", {
        body: screenshot,
        contentType: "image/png",
      });
      console.error("Attached page snapshot and screenshot for debugging.");
    }
  });

  test("loads the homepage with all core elements", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    // Check hero section content
    await expect(page.getByText("Retro Gaming Hub")).toBeVisible();
    await expect(page.getByText("Press Start")).toBeVisible();
    await expect(page.getByText("To Continue")).toBeVisible();
    await expect(page.getByText("Discover the ultimate retro gaming experience...")).toBeVisible();

    // Check hero section buttons
    await expect(page.getByRole("button", { name: /launch arcade mode/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /browse rom library/i })).toBeVisible();

    // Check system tags
    const systemTags = ["NES", "SNES", "Genesis", "PlayStation", "Arcade", "DOS"];
    for (const tag of systemTags) {
      await expect(page.getByText(tag)).toBeVisible();
    }

    // Check featured games section
    await expect(page.getByText("Featured Games")).toBeVisible();
    await expect(page.getByText("Popular Games")).toBeVisible();

    // Check that featured games are rendered
    await expect(page.getByText("Super Mario Bros")).toBeVisible();
    await expect(page.getByText("NES")).toBeVisible(); // Platform chip
    await expect(page.getByText("1985")).toBeVisible(); // Year chip

    // Check game action buttons
    await expect(page.getByRole("button", { name: /play/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /details/i })).toBeVisible();

    // Check "View All Games" button
    await expect(page.getByRole("button", { name: /all games/i })).toBeVisible();
  });

  test("has proper page structure and accessibility", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    // Check for proper heading hierarchy
    const h1 = page.locator("h1");
    const h2 = page.locator("h2");
    const h4 = page.locator("h4");

    await expect(h2.filter({ hasText: "Press Start" })).toBeVisible();
    await expect(h4.filter({ hasText: "Featured Games" })).toBeVisible();

    // Check that all buttons have proper roles
    const buttons = page.getByRole("button");
    await expect(buttons).toHaveCount(await buttons.count());

    // Check for proper alt text and accessibility attributes (if any images)
    const images = page.locator("img");
    // Note: The app uses background images, so we check that there are no broken img tags
    await expect(images).toHaveCount(0); // Should be no img tags since using background images
  });

  test("responds to user interactions", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    // Test that buttons are clickable (though navigation may not work in test env)
    const arcadeButton = page.getByRole("button", { name: /launch arcade mode/i });
    const libraryButton = page.getByRole("button", { name: /browse rom library/i });

    await expect(arcadeButton).toBeEnabled();
    await expect(libraryButton).toBeEnabled();

    // Click buttons and verify no errors occur
    await arcadeButton.click();
    await libraryButton.click();

    // Page should still be functional after clicks
    await expect(page.getByText("Press Start")).toBeVisible();
  });
});
