import { test, expect } from "@playwright/test";

test.describe("Recipient Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Login as recipient before each test
    await page.goto("/login");
    await page.fill('input[type="email"]', "recipient@test.com");
    await page.fill('input[type="password"]', "test123");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/recipient", { timeout: 10000 });
  });

  test.describe("Dashboard", () => {
    test("recipient dashboard loads successfully", async ({ page }) => {
      await expect(page.locator("h1")).toContainText("Dashboard");
      await expect(page.locator("text=Donasi Tersedia")).toBeVisible();
    });

    test("dashboard shows nutrition tracking", async ({ page }) => {
      await expect(page.locator("text=AKG Hari Ini")).toBeVisible();
      await expect(page.locator("text=Protein")).toBeVisible();
    });

    test("dashboard has navigation menu", async ({ page }) => {
      await expect(page.locator("text=Beranda")).toBeVisible();
      await expect(page.locator("text=Donasi Aktif")).toBeVisible();
      await expect(page.locator("text=Riwayat")).toBeVisible();
    });
  });

  test.describe("View Active Donations", () => {
    test("active donations list shows available donations", async ({
      page,
    }) => {
      await page.click("text=Donasi Aktif");
      await expect(page.locator("h1")).toContainText("Donasi");
      // Check if there are donation cards or empty state
      const donationCards = page.locator("[data-testid='donation-card']");
      const emptyState = page.locator("text=Belum ada donasi");
      await expect(donationCards.first().or(emptyState)).toBeVisible();
    });

    test("donation card shows food name and donor info", async ({ page }) => {
      await page.click("text=Donasi Aktif");
      const donationCard = page
        .locator("[data-testid='donation-card']")
        .first();
      if (await donationCard.isVisible()) {
        await expect(donationCard.locator("text=porsi")).toBeVisible();
      }
    });

    test("can claim a donation", async ({ page }) => {
      await page.click("text=Donasi Aktif");
      const claimButton = page.locator('button:has-text("Klaim")').first();
      if (await claimButton.isVisible()) {
        await claimButton.click();
        // Should show confirmation or success message
        await expect(page.locator("text=berhasil")).toBeVisible();
      }
    });
  });

  test.describe("Transit Donations", () => {
    test("transit page shows claimed donations", async ({ page }) => {
      await page.click("text=Transit");
      await expect(page.locator("h1")).toContainText("Transit");
      // Check if there are transit cards or empty state
      const transitCards = page.locator("[data-testid='transit-card']");
      const emptyState = page.locator("text=Belum ada donasi dalam transit");
      await expect(transitCards.first().or(emptyState)).toBeVisible();
    });

    test("can confirm donation arrival", async ({ page }) => {
      await page.click("text=Transit");
      const confirmButton = page
        .locator('button:has-text("Konfirmasi")')
        .first();
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
        // Should show success message
        await expect(page.locator("text=berhasil")).toBeVisible();
      }
    });
  });

  test.describe("Donation History", () => {
    test("history page shows completed donations", async ({ page }) => {
      await page.click("text=Riwayat");
      await expect(page.locator("h1")).toContainText("Riwayat");
      // Check if there are history cards or empty state
      const historyCards = page.locator("[data-testid='history-card']");
      const emptyState = page.locator("text=Belum ada riwayat");
      await expect(historyCards.first().or(emptyState)).toBeVisible();
    });

    test("can leave a review for completed donation", async ({ page }) => {
      await page.click("text=Riwayat");
      const reviewButton = page.locator('button:has-text("Ulas")').first();
      if (await reviewButton.isVisible()) {
        await reviewButton.click();
        // Should show review modal
        await expect(
          page.locator("[data-testid='review-modal']"),
        ).toBeVisible();
      }
    });
  });

  test.describe("Emergency Request", () => {
    test("can request emergency status", async ({ page }) => {
      const emergencyButton = page
        .locator('button:has-text("Darurat")')
        .first();
      if (await emergencyButton.isVisible()) {
        await emergencyButton.click();
        // Should show confirmation dialog
        await expect(page.locator("text=Konfirmasi")).toBeVisible();
      }
    });
  });

  test.describe("Profile", () => {
    test("profile modal opens on click", async ({ page }) => {
      await page.click('[data-testid="profile-button"]');
      await expect(page.locator("[data-testid='profile-modal']")).toBeVisible();
    });

    test("profile shows user information", async ({ page }) => {
      await page.click('[data-testid="profile-button"]');
      await expect(page.locator("text=recipient@test.com")).toBeVisible();
    });
  });
});
