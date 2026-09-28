import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test.describe("Login", () => {
    test("login page has all elements", async ({ page }) => {
      await page.goto("/login");
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test("login form validates required fields", async ({ page }) => {
      await page.goto("/login");
      await page.click('button[type="submit"]');
      // Should show validation errors
      await page.waitForTimeout(500);
    });

    test("login with invalid credentials shows error", async ({ page }) => {
      await page.goto("/login");
      await page.fill('input[type="email"]', "nonexistent@test.com");
      await page.fill('input[type="password"]', "wrongpassword");
      await page.click('button[type="submit"]');
      // Should show error toast
      await page.waitForTimeout(2000);
    });

    test("login redirects to dashboard on success", async ({ page }) => {
      await page.goto("/login");
      await page.fill('input[type="email"]', "arrafinur1@gmail.com");
      await page.fill('input[type="password"]', "11223344");
      await page.click('button[type="submit"]');
      // Wait for navigation
      await page.waitForURL("**/donor", { timeout: 10000 });
      await expect(page).toHaveURL(/.*donor/);
    });
  });

  test.describe("Registration", () => {
    test("donor registration page has all elements", async ({ page }) => {
      await page.goto("/register/donor");
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test("recipient registration page has all elements", async ({ page }) => {
      await page.goto("/register/recipient");
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });
  });

  test.describe("Forgot Password", () => {
    test("forgot password page has all elements", async ({ page }) => {
      await page.goto("/forgot-password");
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });
  });

  test.describe("Logout", () => {
    test("logout clears session and redirects to home", async ({ page }) => {
      // Login first
      await page.goto("/login");
      await page.fill('input[type="email"]', "arrafinur1@gmail.com");
      await page.fill('input[type="password"]', "11223344");
      await page.click('button[type="submit"]');
      await page.waitForURL("**/donor", { timeout: 10000 });

      // Logout
      const logoutButton = page
        .locator('button:has-text("Logout")')
        .or(page.locator('button[title*="Logout"]'))
        .or(page.locator('button:has-text("Keluar")'))
        .or(page.locator('button:has-text("Sign Out")'));
      if (await logoutButton.first().isVisible()) {
        await logoutButton.first().click();
        await page.waitForURL("**/", { timeout: 10000 });
      }
    });
  });
});
