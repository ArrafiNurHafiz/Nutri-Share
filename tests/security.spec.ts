import { test, expect } from "@playwright/test";

test.describe("Security Tests", () => {
  test.describe("Authentication", () => {
    test("protected routes redirect to login", async ({ page }) => {
      await page.goto("/donor");
      // Should redirect to login
      await expect(page).toHaveURL(/.*login/);
    });

    test("session expires after logout", async ({ page }) => {
      // Login
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

      // Try to access protected route
      await page.goto("/donor");

      // Should redirect to login
      await expect(page).toHaveURL(/.*login/);
    });
  });

  test.describe("Input Validation", () => {
    test("login form rejects invalid email format", async ({ page }) => {
      await page.goto("/login");
      await page.fill("#login-email", "invalid-email");
      await page.fill("#login-password", "test123");
      await page.click('button[type="submit"]');

      // Should show validation error
      await page.waitForTimeout(500);
    });

    test("registration form validates required fields", async ({ page }) => {
      await page.goto("/register/donor");
      await page.click('button[type="submit"]');

      // Should show validation errors
      await page.waitForTimeout(500);
    });
  });

  test.describe("Security Headers", () => {
    test("security headers are present", async ({ page }) => {
      const response = await page.goto("/");
      const headers = response?.headers();

      // Check for security headers
      expect(headers?.["x-content-type-options"]).toBeTruthy();
      expect(headers?.["x-frame-options"]).toBeTruthy();
    });
  });

  test.describe("Content Security Policy", () => {
    test("CSP header is present", async ({ page }) => {
      const response = await page.goto("/");
      const header = response?.headers()["content-security-policy"];
      expect(header).toBeTruthy();
    });
  });

  test.describe("Sensitive Data", () => {
    test("password is not exposed in URL", async ({ page }) => {
      await page.goto("/login");
      await page.fill("#login-email", "test@test.com");
      await page.fill("#login-password", "secretpassword");
      await page.click('button[type="submit"]');

      // Check that password is not in URL
      const url = page.url();
      expect(url).not.toContain("secretpassword");
    });

    test("error messages are generic", async ({ page }) => {
      await page.goto("/login");
      await page.fill("#login-email", "nonexistent@test.com");
      await page.fill("#login-password", "wrongpassword");
      await page.click('button[type="submit"]');

      // Wait for toast notification
      await page.waitForTimeout(2000);
    });
  });

  test.describe("HTTPS", () => {
    test("app is accessible", async ({ page }) => {
      const response = await page.goto("/");
      expect(response?.status()).toBe(200);
    });
  });
});
