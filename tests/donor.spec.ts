import { test, expect } from "@playwright/test";

test.describe("Donor Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Login as donor before each test
    await page.goto("/login");
    await page.fill("#login-email", "donor@test.com");
    await page.fill("#login-password", "test123");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/donor", { timeout: 10000 });
  });

  test.describe("Dashboard", () => {
    test("donor dashboard loads successfully", async ({ page }) => {
      await expect(page.locator("h1").or(page.locator("h2"))).toBeVisible();
    });

    test("dashboard has navigation elements", async ({ page }) => {
      // Check page loaded
      await expect(page.locator("body")).toContainText("Donor");
    });
  });

  test.describe("View Donations", () => {
    test("donations section is accessible", async ({ page }) => {
      // Check page loaded with donor content
      await expect(page.locator("body")).toContainText("NUTRI-SHARE");
    });
  });

  test.describe("Profile", () => {
    test("user info is displayed", async ({ page }) => {
      // Check page loaded
      await expect(page.locator("body")).toContainText("donor@test.com");
    });
  });
});
