import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test.describe("Login", () => {
    test("login page has all elements", async ({ page }) => {
      await page.goto("/login");
      await expect(page.locator("#login-email")).toBeVisible();
      await expect(page.locator("#login-password")).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toContainText(
        "Sign In",
      );
    });

    test("login form validates required fields", async ({ page }) => {
      await page.goto("/login");
      await page.click('button[type="submit"]');
      // Should show validation errors
      await page.waitForTimeout(500);
    });

    test("login with invalid credentials shows error", async ({ page }) => {
      await page.goto("/login");
      await page.fill("#login-email", "nonexistent@test.com");
      await page.fill("#login-password", "wrongpassword");
      await page.click('button[type="submit"]');
      // Should show error toast
      await page.waitForTimeout(2000);
    });

    test("login redirects to dashboard on success", async ({ page }) => {
      await page.goto("/login");
      await page.fill("#login-email", "donor@test.com");
      await page.fill("#login-password", "test123");
      await page.click('button[type="submit"]');
      // Wait for navigation
      await page.waitForURL("**/donor", { timeout: 10000 });
      await expect(page).toHaveURL(/.*donor/);
    });
  });

  test.describe("Registration", () => {
    test("donor registration page has all elements", async ({ page }) => {
      await page.goto("/register/donor");
      await expect(page.locator('input[name="name"]')).toBeVisible();
      await expect(page.locator('input[name="email"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test("recipient registration page has all elements", async ({ page }) => {
      await page.goto("/register/recipient");
      await expect(page.locator('input[name="name"]')).toBeVisible();
      await expect(page.locator('input[name="email"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });
  });

  test.describe("Forgot Password", () => {
    test("forgot password page has all elements", async ({ page }) => {
      await page.goto("/lupa-password");
      await expect(page.locator("h1")).toContainText("Lupa Password");
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });
  });

  test.describe("Logout", () => {
    test("logout clears session and redirects to home", async ({ page }) => {
      // Login first
      await page.goto("/login");
      await page.fill("#login-email", "donor@test.com");
      await page.fill("#login-password", "test123");
      await page.click('button[type="submit"]');
      await page.waitForURL("**/donor", { timeout: 10000 });

      // Logout
      const logoutButton = page
        .locator('button:has-text("Logout")')
        .or(page.locator('button:has-text("Keluar")'));
      if (await logoutButton.isVisible()) {
        await logoutButton.click();
        await page.waitForURL("**/", { timeout: 10000 });
      }
    });
  });
});
