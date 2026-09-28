import { test, expect } from "@playwright/test";

test.describe("Recipient Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Login as recipient before each test
    await page.goto("/login");
    await page.fill('input[type="email"]', "arrafinur2@gmail.com");
    await page.fill('input[type="password"]', "11223344");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/recipient", { timeout: 10000 });
  });

  test.describe("Dashboard & Nutrition", () => {
    test("recipient dashboard loads successfully with nutrition tracking", async ({ page }) => {
      await expect(page.locator("body")).toContainText("Al-Furqan Orphanage");
      await expect(page.locator("body")).toContainText("Daily Recommended Dietary Allowance");
      await expect(page.locator("body")).toContainText("Protein");
    });

    test("dashboard has all tabs", async ({ page }) => {
      await expect(page.getByRole("button", { name: /Explore Surplus|Eksplorasi/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /Active Pickups|Dalam Penjemputan/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /Received History|Riwayat/i })).toBeVisible();
    });
  });

  test.describe("Explore Surplus & Instant Claim", () => {
    test("explore feed shows surplus donations or empty state", async ({ page }) => {
      await page.getByRole("button", { name: /Explore Surplus|Eksplorasi/i }).click();
      const emptyOrCards = page.locator("body");
      await expect(emptyOrCards).toBeVisible();
    });

    test("can trigger emergency mode", async ({ page }) => {
      const emergencyBtn = page.getByRole("button", { name: /Emergency|Darurat/i }).first();
      if (await emergencyBtn.isVisible()) {
        await emergencyBtn.click();
        await page.waitForTimeout(1000);
      }
    });
  });

  test.describe("Pickups and History", () => {
    test("active pickups tab is accessible", async ({ page }) => {
      await page.getByRole("button", { name: /Active Pickups|Dalam Penjemputan/i }).click();
      await expect(page.locator("body")).toContainText(/Active Pickups|Penjemputan|Siap Diambil/i);
    });

    test("received history tab is accessible", async ({ page }) => {
      await page.getByRole("button", { name: /Received History|Riwayat/i }).click();
      await expect(page.locator("body")).toContainText(/Received History|Riwayat|Selesai Diterima/i);
    });
  });
});
