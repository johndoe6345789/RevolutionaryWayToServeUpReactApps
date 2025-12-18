import { expect, test } from "@playwright/test";

test.describe("RetroDeck Client", () => {
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

  test("renders the hero area after compilation", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    const assertions = [
      "RetroDeck",
      /Press Start/i,
      /Launch Arcade Mode/i,
      /Browse ROM Library/i,
    ];

    for (const matcher of assertions) {
      await expect(page.getByText(matcher)).toBeVisible();
    }
  });
});
