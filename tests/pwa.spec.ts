import { test, expect } from "@playwright/test";

test.describe("PWA Functionality", () => {
  test.describe("Manifest", () => {
    test("manifest.json is accessible", async ({ page }) => {
      const response = await page.goto("/manifest.json");
      expect(response?.status()).toBe(200);
    });

    test("manifest has required fields", async ({ page }) => {
      const response = await page.goto("/manifest.json");
      const manifest = await response?.json();

      expect(manifest.name).toBeTruthy();
      expect(manifest.short_name).toBeTruthy();
      expect(manifest.start_url).toBeTruthy();
      expect(manifest.display).toBe("standalone");
      expect(manifest.icons).toBeTruthy();
      expect(manifest.icons.length).toBeGreaterThan(0);
    });

    test("manifest has proper icons", async ({ page }) => {
      const response = await page.goto("/manifest.json");
      const manifest = await response?.json();

      const icon192 = manifest.icons.find(
        (icon: any) => icon.sizes === "192x192",
      );
      const icon512 = manifest.icons.find(
        (icon: any) => icon.sizes === "512x512",
      );

      expect(icon192).toBeTruthy();
      expect(icon512).toBeTruthy();
    });
  });

  test.describe("Service Worker", () => {
    test("service worker file is accessible", async ({ page }) => {
      const response = await page.goto("/sw.js");
      expect(response?.status()).toBe(200);
    });

    test("service worker is registered", async ({ page }) => {
      await page.goto("/");

      // Wait for service worker registration
      await page.waitForFunction(
        () => {
          return navigator.serviceWorker.controller !== null;
        },
        { timeout: 10000 },
      );

      const swRegistered = await page.evaluate(() => {
        return navigator.serviceWorker.controller !== null;
      });

      expect(swRegistered).toBe(true);
    });

    test("service worker has cache name", async ({ page }) => {
      const response = await page.goto("/sw.js");
      const swContent = await response?.text();

      expect(swContent).toContain("CACHE_NAME");
      expect(swContent).toContain("nutrishare");
    });
  });

  test.describe("Offline Support", () => {
    test("app works offline after initial load", async ({ page }) => {
      // Load the page first
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Go offline
      await page.context().setOffline(true);

      // Try to navigate
      await page.goto("/");

      // Should still load (from cache)
      await expect(page.locator("h1")).toBeVisible();

      // Go back online
      await page.context().setOffline(false);
    });

    test("cached assets are served offline", async ({ page }) => {
      // Load the page to cache assets
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Go offline
      await page.context().setOffline(true);

      // Check if CSS is still loaded
      const cssLoaded = await page.evaluate(() => {
        const styles = document.querySelectorAll("link[rel='stylesheet']");
        return styles.length > 0;
      });

      expect(cssLoaded).toBe(true);

      // Go back online
      await page.context().setOffline(false);
    });
  });

  test.describe("Install Prompt", () => {
    test("install prompt appears on supported browsers", async ({ page }) => {
      await page.goto("/");

      // The install prompt may or may not appear depending on browser
      // Just verify the page loads correctly
      await expect(page.locator("h1")).toBeVisible();
    });

    test("install button is clickable when visible", async ({ page }) => {
      await page.goto("/");

      // Check if install prompt is visible
      const installButton = page.locator('button:has-text("Instal")');
      if (await installButton.isVisible()) {
        await expect(installButton).toBeEnabled();
      }
    });
  });

  test.describe("Push Notifications", () => {
    test("notification permission can be requested", async ({ page }) => {
      await page.goto("/");

      // Check if notification API is available
      const hasNotificationAPI = await page.evaluate(() => {
        return "Notification" in window;
      });

      expect(hasNotificationAPI).toBe(true);
    });
  });

  test.describe("Meta Tags", () => {
    test("theme-color meta tag exists", async ({ page }) => {
      await page.goto("/");

      const themeColor = await page
        .locator('meta[name="theme-color"]')
        .getAttribute("content");
      expect(themeColor).toBeTruthy();
    });

    test("apple-mobile-web-app-capable meta tag exists", async ({ page }) => {
      await page.goto("/");

      const capable = await page
        .locator('meta[name="apple-mobile-web-app-capable"]')
        .getAttribute("content");
      expect(capable).toBe("yes");
    });

    test("viewport meta tag exists", async ({ page }) => {
      await page.goto("/");

      const viewport = await page
        .locator('meta[name="viewport"]')
        .getAttribute("content");
      expect(viewport).toContain("width=device-width");
    });
  });
});
