import { test, expect } from "@playwright/test";

test.describe("Donor Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Login as donor before each test
    await page.goto("/login");
    await page.fill('input[type="email"]', "arrafinur1@gmail.com");
    await page.fill('input[type="password"]', "11223344");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/donor", { timeout: 10000 });
  });

  test.describe("Dashboard", () => {
    test("donor dashboard loads successfully", async ({ page }) => {
      await expect(page.locator("h1, h2").first()).toBeVisible();
    });

    test("dashboard has navigation elements", async ({ page }) => {
      // Check page loaded
      await expect(page.locator("body")).toContainText("Donor");
    });
  });

  test.describe("View Donations", () => {
    test("donations section is accessible", async ({ page }) => {
      // Check page loaded with donor content
      await expect(page.locator("body")).toContainText("NutriShare");
    });
  });

  test.describe("Profile", () => {
    test("user info is displayed", async ({ page }) => {
      // Check page loaded with business name
      await expect(page.locator("body")).toContainText("Hotel Merapi Merbabu");
    });
  });
});
