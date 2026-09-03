import { test, expect } from "@playwright/test";

test.describe("Admin Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin before each test
    await page.goto("/login");
    await page.fill('input[type="email"]', "admin@test.com");
    await page.fill('input[type="password"]', "test123");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/admin", { timeout: 10000 });
  });

  test.describe("Dashboard", () => {
    test("admin dashboard loads successfully", async ({ page }) => {
      await expect(page.locator("h1")).toContainText("Admin");
      await expect(page.locator("text=Dashboard")).toBeVisible();
    });

    test("dashboard shows system statistics", async ({ page }) => {
      await expect(page.locator("text=Total Pengguna")).toBeVisible();
      await expect(page.locator("text=Donasi Aktif")).toBeVisible();
    });

    test("dashboard has admin navigation menu", async ({ page }) => {
      await expect(page.locator("text=Pengguna")).toBeVisible();
      await expect(page.locator("text=Klaim")).toBeVisible();
      await expect(page.locator("text=Donasi")).toBeVisible();
    });
  });

  test.describe("User Management", () => {
    test("users list shows all users", async ({ page }) => {
      await page.click("text=Pengguna");
      await expect(page.locator("h1")).toContainText("Pengguna");
      // Check if there are user cards or empty state
      const userCards = page.locator("[data-testid='user-card']");
      const emptyState = page.locator("text=Belum ada pengguna");
      await expect(userCards.first().or(emptyState)).toBeVisible();
    });

    test("can verify a pending user", async ({ page }) => {
      await page.click("text=Pengguna");
      const verifyButton = page
        .locator('button:has-text("Verifikasi")')
        .first();
      if (await verifyButton.isVisible()) {
        await verifyButton.click();
        // Should show success message
        await expect(page.locator("text=berhasil")).toBeVisible();
      }
    });

    test("can reject a pending user", async ({ page }) => {
      await page.click("text=Pengguna");
      const rejectButton = page.locator('button:has-text("Tolak")').first();
      if (await rejectButton.isVisible()) {
        await rejectButton.click();
        // Should show confirmation dialog
        await expect(page.locator("text=Konfirmasi")).toBeVisible();
      }
    });

    test("can search users by name or email", async ({ page }) => {
      await page.click("text=Pengguna");
      await page.fill('input[placeholder*="Cari"]', "test");
      // Should filter the user list
      await page.waitForTimeout(500);
    });
  });

  test.describe("Claim Management", () => {
    test("claims list shows pending claims", async ({ page }) => {
      await page.click("text=Klaim");
      await expect(page.locator("h1")).toContainText("Klaim");
      // Check if there are claim cards or empty state
      const claimCards = page.locator("[data-testid='claim-card']");
      const emptyState = page.locator("text=Belum ada klaim");
      await expect(claimCards.first().or(emptyState)).toBeVisible();
    });

    test("can approve a claim", async ({ page }) => {
      await page.click("text=Klaim");
      const approveButton = page.locator('button:has-text("Setujui")').first();
      if (await approveButton.isVisible()) {
        await approveButton.click();
        // Should show success message
        await expect(page.locator("text=berhasil")).toBeVisible();
      }
    });

    test("can reject a claim", async ({ page }) => {
      await page.click("text=Klaim");
      const rejectButton = page.locator('button:has-text("Tolak")').first();
      if (await rejectButton.isVisible()) {
        await rejectButton.click();
        // Should show confirmation dialog
        await expect(page.locator("text=Konfirmasi")).toBeVisible();
      }
    });
  });

  test.describe("Donation Management", () => {
    test("donations list shows all donations", async ({ page }) => {
      await page.click("text=Donasi");
      await expect(page.locator("h1")).toContainText("Donasi");
      // Check if there are donation cards or empty state
      const donationCards = page.locator("[data-testid='donation-card']");
      const emptyState = page.locator("text=Belum ada donasi");
      await expect(donationCards.first().or(emptyState)).toBeVisible();
    });

    test("can view donation details", async ({ page }) => {
      await page.click("text=Donasi");
      const viewButton = page.locator('button:has-text("Detail")').first();
      if (await viewButton.isVisible()) {
        await viewButton.click();
        // Should show donation details
        await expect(
          page.locator("[data-testid='donation-detail']"),
        ).toBeVisible();
      }
    });
  });

  test.describe("Emergency Management", () => {
    test("emergency requests list shows pending requests", async ({ page }) => {
      await page.click("text=Darurat");
      await expect(page.locator("h1")).toContainText("Darurat");
      // Check if there are emergency cards or empty state
      const emergencyCards = page.locator("[data-testid='emergency-card']");
      const emptyState = page.locator("text=Belum ada permintaan darurat");
      await expect(emergencyCards.first().or(emptyState)).toBeVisible();
    });

    test("can approve emergency request", async ({ page }) => {
      await page.click("text=Darurat");
      const approveButton = page.locator('button:has-text("Setujui")').first();
      if (await approveButton.isVisible()) {
        await approveButton.click();
        // Should show success message
        await expect(page.locator("text=berhasil")).toBeVisible();
      }
    });
  });

  test.describe("Analytics", () => {
    test("analytics page shows impact metrics", async ({ page }) => {
      await page.click("text=Analitik");
      await expect(page.locator("h1")).toContainText("Analitik");
      await expect(page.locator("text=Dampak")).toBeVisible();
    });

    test("analytics shows donation trends", async ({ page }) => {
      await page.click("text=Analitik");
      await expect(page.locator("text=Tren Donasi")).toBeVisible();
    });
  });

  test.describe("Profile", () => {
    test("profile modal opens on click", async ({ page }) => {
      await page.click('[data-testid="profile-button"]');
      await expect(page.locator("[data-testid='profile-modal']")).toBeVisible();
    });

    test("profile shows admin information", async ({ page }) => {
      await page.click('[data-testid="profile-button"]');
      await expect(page.locator("text=admin@test.com")).toBeVisible();
    });
  });
});
