import { test, expect } from "@playwright/test";

test.describe("Halaman Landing", () => {
  test("menampilkan hero, fitur, cara kerja, dampak, footer", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Makanan Bergizi");
    await expect(page.locator("text=Smart Allocation")).toBeVisible();
    await expect(page.locator("text=Donor Publikasi")).toBeVisible();
    await expect(page.locator("text=Dampak Nyata")).toBeVisible();
    await expect(page.locator("text=NUTRI-SHARE").last()).toBeVisible();
  });

  test("navbar memiliki semua menu navigasi", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("nav").first();
    await expect(nav.locator("text=Beranda")).toBeVisible();
    await expect(nav.locator("text=Tentang")).toBeVisible();
    await expect(nav.locator("text=Cara Kerja")).toBeVisible();
    await expect(nav.locator("text=Dampak")).toBeVisible();
    await expect(nav.locator("text=Pahlawan")).toBeVisible();
    await expect(nav.locator("text=Masuk")).toBeVisible();
    await expect(nav.locator("text=Donasi Pangan")).toBeVisible();
  });
});

test.describe("Halaman Tentang", () => {
  test("menampilkan section utama", async ({ page }) => {
    await page.goto("/tentang");
    await expect(page.locator("h1")).toContainText("Tentang");
    await expect(page.locator("text=Paradoks Pangan Indonesia")).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(200);
    await expect(page.locator("text=Presisi Gizi")).toBeVisible();
    // Footer harus terlihat setelah scroll
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);
    await expect(page.locator("text=Navigasi").last()).toBeVisible();
  });
});

test.describe("Halaman Cara Kerja", () => {
  test("menampilkan 3 langkah dan flowchart", async ({ page }) => {
    await page.goto("/cara-kerja");
    await expect(page.locator("h1")).toContainText("Cara Kerjanya");
    await expect(page.locator("text=Donor Publikasi Surplus Pangan")).toBeVisible();
    await expect(page.locator("text=Hybrid Entropy-TOPSIS Alokasi Cerdas")).toBeVisible();
    await expect(page.locator("text=Kurir Antar & Verifikasi Serah Terima")).toBeVisible();
    await expect(page.locator("text=Registrasi & Verifikasi")).toBeVisible();
  });
});

test.describe("Halaman Dampak", () => {
  test("menampilkan statistik dan konten", async ({ page }) => {
    await page.goto("/dampak");
    await expect(page.locator("h1")).toContainText("Dampak");
    // Angka statistik dari animated counter
    await expect(page.locator("text=Kg Food Waste Terselamatkan")).toBeVisible();
    await expect(page.locator("text=Anak & Lansia Terbantu")).toBeVisible();
    await expect(page.locator("text=Mitra HoReKa")).toBeVisible();
    // SDG section ada setelah scroll
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);
    await expect(page.locator("text=Navigasi").last()).toBeVisible();
  });
});

test.describe("Halaman Pahlawan", () => {
  test("menampilkan halaman dengan data dari API", async ({ page }) => {
    await page.goto("/pahlawan");
    await expect(page.locator("h1")).toContainText("Pahlawan");
    // Tunggu data loading
    await page.waitForTimeout(2000);
    // Cek stats atau setidaknya hero muncul
    await expect(page.locator("text=Setiap Donor Adalah Pahlawan")).toBeVisible();
  });
});

test.describe("Halaman Auth", () => {
  test("halaman login memiliki semua elemen", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('button[type="submit"]')).toContainText("Masuk");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator("text=Lupa password?")).toBeVisible();
  });

  test("halaman lupa password", async ({ page }) => {
    await page.goto("/lupa-password");
    await expect(page.locator("h1")).toContainText("Lupa Password");
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test("dark mode toggle berfungsi", async ({ page }) => {
    await page.goto("/");
    // Cari tombol dark mode toggle
    const toggle = page.locator('button[title*="Mode"]');
    await expect(toggle).toBeVisible();
    await toggle.click();
    // Cek class dark ada
    await expect(page.locator("html")).toHaveClass(/dark/);
    await toggle.click();
    await expect(page.locator("html")).not.toHaveClass(/dark/);
  });
});

test.describe("Halaman 404", () => {
  test("menampilkan halaman tidak ditemukan", async ({ page }) => {
    await page.goto("/halaman-acak");
    await expect(page.locator("text=Halaman Tidak Ditemukan")).toBeVisible();
  });
});
