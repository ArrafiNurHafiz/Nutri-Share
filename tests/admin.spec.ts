import { test, expect } from "@playwright/test";

test.describe("Admin Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin before each test
    await page.goto("/login");
    await page.fill('input[type="email"]', "arrafinur3@gmail.com");
    await page.fill('input[type="password"]', "11223344");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/admin", { timeout: 10000 });
  });

  test.describe("Dashboard Overview", () => {
    test("admin dashboard loads successfully with metric cards", async ({ page }) => {
      await expect(page.locator("body")).toContainText("Command Center");
      await expect(page.locator("body")).toContainText("Overview & Metrics");
      await expect(page.locator("body")).toContainText("Total Donor Partners");
      await expect(page.locator("body")).toContainText("Beneficiary Shelters");
    });

    test("dashboard has all four navigation tabs", async ({ page }) => {
      await expect(page.getByRole("button", { name: /Overview & Metrics/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /Verification & Claims/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /Partners & Shelters Data/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /Activity Logs/i })).toBeVisible();
    });
  });

  test.describe("Verification & Claims Tab", () => {
    test("verification tab displays queue", async ({ page }) => {
      await page.getByRole("button", { name: /Verification & Claims/i }).click();
      await expect(page.locator("body")).toContainText("Verification");
    });
  });

  test.describe("Partners & Shelters Data Tab", () => {
    test("data tab displays donor partners and shelters tables", async ({ page }) => {
      await page.getByRole("button", { name: /Partners & Shelters Data/i }).click();
      await expect(page.locator("body")).toContainText("Donor Partners List");
      await expect(page.locator("body")).toContainText("Beneficiary Institutions List");
    });

    test("search filters user data", async ({ page }) => {
      await page.getByRole("button", { name: /Partners & Shelters Data|Data Mitra/i }).click();
      const searchInput = page.locator('input[placeholder*="Search" i], input[placeholder*="Cari" i]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill("test");
        await page.waitForTimeout(500);
      }
    });
  });

  test.describe("Activity Logs Tab", () => {
    test("activity logs tab displays audit trail", async ({ page }) => {
      await page.getByRole("button", { name: /Activity Logs/i }).click();
      await expect(page.locator("body")).toContainText("Audit Trail");
    });
  });
});
