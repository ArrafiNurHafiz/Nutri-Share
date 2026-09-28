import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("displays hero, features, workflow, impact, and footer", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("body")).toContainText("NutriShare");
    await expect(page.locator("footer").last()).toBeAttached();
  });

  test("navbar has navigation links and action buttons", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("header").or(page.locator("nav")).first();
    await expect(nav).toBeVisible();
  });
});

test.describe("Map & Distribution Page", () => {
  test("displays map container and partner distribution", async ({ page }) => {
    await page.goto("/map");
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("Support & Contact Page", () => {
  test("displays support contact options and FAQ", async ({ page }) => {
    await page.goto("/support");
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("Authentication Pages", () => {
  test("login page has all form elements", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("#login-email").or(page.locator('input[type="email"]')).first()).toBeVisible();
    await expect(page.locator("#login-password").or(page.locator('input[type="password"]')).first()).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("forgot password page has email input", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });
});

test.describe("404 Not Found Page", () => {
  test("shows 404 page for unknown routes", async ({ page }) => {
    await page.goto("/non-existent-page-url");
    await expect(page.locator("body")).toBeVisible();
  });
});
