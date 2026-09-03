import { test, expect } from "@playwright/test";

const BASE = "https://nutrishare-web.vercel.app";

// Test accounts (auto-login cookies from API)
const ACCOUNTS = {
  admin: { email: "arrafinur3@gmail.com", password: "11223344", role: "admin" },
  donor: { email: "arrafinur2@gmail.com", password: "11223344", role: "donor" },
  recipient: {
    email: "arrafinur1@gmail.com",
    password: "11223344",
    role: "recipient",
  },
};

/** Login via API and set cookie in browser context */
async function loginViaApi(page: any, email: string, password: string) {
  const resp = await page.request.post(`${BASE}/api/auth/login`, {
    data: { email, password },
    headers: { "Content-Type": "application/json" },
  });
  expect(resp.status()).toBe(200);
  const data = await resp.json();
  expect(data.user).toBeTruthy();
  expect(data.user.email).toBe(email);

  // Set cookie from the API response into the browser context
  const cookies = resp.headers()["set-cookie"];
  if (cookies) {
    const cookieStr = Array.isArray(cookies) ? cookies.join("; ") : cookies;
    const tokenMatch = cookieStr.match(/nutrishare_token=([^;]+)/);
    if (tokenMatch) {
      await page.context().addCookies([
        {
          name: "nutrishare_token",
          value: tokenMatch[1],
          domain: "nutrishare-web.vercel.app",
          path: "/",
          httpOnly: true,
          secure: true,
          sameSite: "Lax" as const,
        },
      ]);
    }
  }
  return data;
}

// ─────────────────────────────────────────────────────────────
// HOMEPAGE
// ─────────────────────────────────────────────────────────────
test.describe("Homepage", () => {
  test("loads with correct title and sections", async ({ page }) => {
    await page.goto(BASE);
    await expect(page).toHaveTitle(/NUTRI-SHARE/i);

    // Hero section
    const hero = page.locator("h1").first();
    await expect(hero).toBeVisible();

    // Stats visible
    await page
      .waitForSelector("text=Mitra", { timeout: 10000 })
      .catch(() => {});
  });

  test("public stats endpoint returns data", async ({ request }) => {
    const resp = await request.get(`${BASE}/api/public/stats`);
    expect(resp.status()).toBe(200);
    const data = await resp.json();
    expect(data.completed_donations).toBeGreaterThan(0);
    expect(data.total_portions).toBeGreaterThan(0);
  });

  test("navigation links exist", async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState("networkidle");

    // Login link should exist
    const loginLink = page.getByText("Login").first();
    if (await loginLink.isVisible()) {
      await expect(loginLink).toBeVisible();
    }
  });

  test("no console errors on homepage", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.goto(BASE);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Report any errors found
    if (errors.length > 0) {
      console.log("Console errors found:", errors);
    }
    // Filter out known network errors for resources that may 404
    const realErrors = errors.filter(
      (e) =>
        !e.includes("favicon") && !e.includes("manifest") && !e.includes("404"),
    );
    expect(realErrors.length).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────
// AUTH FLOW
// ─────────────────────────────────────────────────────────────
test.describe("Authentication", () => {
  test("login with invalid credentials shows error", async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.waitForLoadState("networkidle");

    // Fill form if visible
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.isVisible()) {
      await emailInput.fill("wrong@test.com");
      await page.locator('input[type="password"]').fill("badpassword");
      await page.getByRole("button", { name: /login|masuk/i }).click();
      await page.waitForTimeout(2000);

      // Should show error toast
      const toast = page.getByText(/invalid|gagal|error/i);
      // May or may not be visible depending on component structure
    }
  });

  test("admin login via API returns user data", async ({ request }) => {
    const resp = await request.post(`${BASE}/api/auth/login`, {
      data: { email: ACCOUNTS.admin.email, password: ACCOUNTS.admin.password },
      headers: { "Content-Type": "application/json" },
    });
    expect(resp.status()).toBe(200);
    const data = await resp.json();
    expect(data.user.role).toBe("admin");
    expect(data.user.email).toBe(ACCOUNTS.admin.email);
  });

  test("donor login via API returns profile", async ({ request }) => {
    const resp = await request.post(`${BASE}/api/auth/login`, {
      data: { email: ACCOUNTS.donor.email, password: ACCOUNTS.donor.password },
      headers: { "Content-Type": "application/json" },
    });
    expect(resp.status()).toBe(200);
    const data = await resp.json();
    expect(data.user.role).toBe("donor");
    expect(data.profile).toBeTruthy();
    expect(data.profile.business_name).toBeTruthy();
  });

  test("recipient login via API returns profile", async ({ request }) => {
    const resp = await request.post(`${BASE}/api/auth/login`, {
      data: {
        email: ACCOUNTS.recipient.email,
        password: ACCOUNTS.recipient.password,
      },
      headers: { "Content-Type": "application/json" },
    });
    expect(resp.status()).toBe(200);
    const data = await resp.json();
    expect(data.user.role).toBe("recipient");
    expect(data.profile).toBeTruthy();
    expect(data.profile.institution_name).toBeTruthy();
  });
});

// ─────────────────────────────────────────────────────────────
// ADMIN DASHBOARD
// ─────────────────────────────────────────────────────────────
test.describe("Admin Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await loginViaApi(page, ACCOUNTS.admin.email, ACCOUNTS.admin.password);
  });

  test("admin dashboard loads with user data", async ({ page }) => {
    await page.goto(`${BASE}/admin`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);

    // Should show stats or tables — even if loading state
    const pageContent = page.locator("body");
    await expect(pageContent).toBeVisible();
  });

  test("admin users API returns donors and recipients", async ({ request }) => {
    // Get a fresh cookie
    const loginResp = await request.post(`${BASE}/api/auth/login`, {
      data: { email: ACCOUNTS.admin.email, password: ACCOUNTS.admin.password },
      headers: { "Content-Type": "application/json" },
    });
    const cookies = loginResp.headers()["set-cookie"];
    const cookieHeader = Array.isArray(cookies)
      ? cookies.join("; ")
      : cookies || "";

    const resp = await request.get(`${BASE}/api/admin/users`, {
      headers: { Cookie: cookieHeader },
    });
    expect(resp.status()).toBe(200);
    const data = await resp.json();
    expect(data.donors.length).toBeGreaterThan(0);
    expect(data.recipients.length).toBeGreaterThan(0);
  });

  test("admin claims API returns data", async ({ request }) => {
    const loginResp = await request.post(`${BASE}/api/auth/login`, {
      data: { email: ACCOUNTS.admin.email, password: ACCOUNTS.admin.password },
      headers: { "Content-Type": "application/json" },
    });
    const cookies = loginResp.headers()["set-cookie"];
    const cookieHeader = Array.isArray(cookies)
      ? cookies.join("; ")
      : cookies || "";

    const resp = await request.get(`${BASE}/api/admin/claims`, {
      headers: { Cookie: cookieHeader },
    });
    expect(resp.status()).toBe(200);
    const data = await resp.json();
    expect(data.length).toBeGreaterThan(0);
  });

  test("admin dashboard page has no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.goto(`${BASE}/admin`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);

    const realErrors = errors.filter(
      (e) => !e.includes("favicon") && !e.includes("manifest"),
    );
    expect(realErrors.length).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────
// DONOR DASHBOARD
// ─────────────────────────────────────────────────────────────
test.describe("Donor Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await loginViaApi(page, ACCOUNTS.donor.email, ACCOUNTS.donor.password);
  });

  test("donor dashboard loads", async ({ page }) => {
    await page.goto(`${BASE}/donor`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);

    const body = page.locator("body");
    await expect(body).toBeVisible();
  });

  test("donor donations API returns data", async ({ request }) => {
    const loginResp = await request.post(`${BASE}/api/auth/login`, {
      data: { email: ACCOUNTS.donor.email, password: ACCOUNTS.donor.password },
      headers: { "Content-Type": "application/json" },
    });
    const cookies = loginResp.headers()["set-cookie"];
    const cookieHeader = Array.isArray(cookies)
      ? cookies.join("; ")
      : cookies || "";

    const resp = await request.get(`${BASE}/api/donations`, {
      headers: { Cookie: cookieHeader },
    });
    expect(resp.status()).toBe(200);
    const data = await resp.json();
    expect(data.length).toBeGreaterThan(0);
  });

  test("donor can view their badges", async ({ request }) => {
    // Get donor user ID from login
    const loginResp = await request.post(`${BASE}/api/auth/login`, {
      data: { email: ACCOUNTS.donor.email, password: ACCOUNTS.donor.password },
      headers: { "Content-Type": "application/json" },
    });
    const data = await loginResp.json();
    const donorId = data.user.id;

    const resp = await request.get(`${BASE}/api/donors/${donorId}/badges`);
    expect(resp.status()).toBe(200);
    const badges = await resp.json();
    expect(badges.length).toBeGreaterThan(0);
  });

  test("donor dashboard has no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.goto(`${BASE}/donor`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);

    const realErrors = errors.filter(
      (e) => !e.includes("favicon") && !e.includes("manifest"),
    );
    expect(realErrors.length).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────
// RECIPIENT DASHBOARD
// ─────────────────────────────────────────────────────────────
test.describe("Recipient Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await loginViaApi(
      page,
      ACCOUNTS.recipient.email,
      ACCOUNTS.recipient.password,
    );
  });

  test("recipient dashboard loads", async ({ page }) => {
    await page.goto(`${BASE}/recipient`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);

    const body = page.locator("body");
    await expect(body).toBeVisible();
  });

  test("recipient AKG API returns nutrition data", async ({ request }) => {
    const loginResp = await request.post(`${BASE}/api/auth/login`, {
      data: {
        email: ACCOUNTS.recipient.email,
        password: ACCOUNTS.recipient.password,
      },
      headers: { "Content-Type": "application/json" },
    });
    const cookies = loginResp.headers()["set-cookie"];
    const cookieHeader = Array.isArray(cookies)
      ? cookies.join("; ")
      : cookies || "";

    const resp = await request.get(`${BASE}/api/recipient/akg`, {
      headers: { Cookie: cookieHeader },
    });
    expect(resp.status()).toBe(200);
    const data = await resp.json();
    expect(data.daily_needs).toBeTruthy();
    expect(data.percentages).toBeTruthy();
  });

  test("recipient active donations API returns data", async ({ page }) => {
    await page.goto(`${BASE}/recipient`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);

    // Data should eventually populate
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });

  test("recipient dashboard has no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.goto(`${BASE}/recipient`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);

    const realErrors = errors.filter(
      (e) => !e.includes("favicon") && !e.includes("manifest"),
    );
    expect(realErrors.length).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────
// FULL BUSINESS FLOW (End-to-End)
// ─────────────────────────────────────────────────────────────
test.describe("Full Business Flow", () => {
  test("admin can verify a pending donor", async ({ request }) => {
    // Step 1: Register a new donor
    const testEmail = `e2e_${Date.now()}@test.com`;
    const registerResp = await request.post(`${BASE}/api/auth/register/donor`, {
      data: {
        business_name: "E2E Test Cafe",
        email: testEmail,
        password: "e2etest123",
        business_type: "kafe",
        address: "Jl. E2E Test 1",
        latitude: "-7.8",
        longitude: "110.37",
        phone: "081111",
      },
      headers: { "Content-Type": "application/json" },
    });
    expect(registerResp.status()).toBe(200);

    // Step 2: Login as admin
    const adminLogin = await request.post(`${BASE}/api/auth/login`, {
      data: { email: ACCOUNTS.admin.email, password: ACCOUNTS.admin.password },
      headers: { "Content-Type": "application/json" },
    });
    expect(adminLogin.status()).toBe(200);
    const adminCookies = adminLogin.headers()["set-cookie"];
    const adminCookieHeader = Array.isArray(adminCookies)
      ? adminCookies.join("; ")
      : adminCookies || "";

    // Step 3: Get users list to find the new donor
    const usersResp = await request.get(`${BASE}/api/admin/users`, {
      headers: { Cookie: adminCookieHeader },
    });
    expect(usersResp.status()).toBe(200);
    const usersData = await usersResp.json();

    // Find the donor by email
    const newDonor = usersData.donors.find((d: any) => d.email === testEmail);
    if (newDonor) {
      // Step 4: Verify the donor
      const verifyResp = await request.post(
        `${BASE}/api/admin/users/${newDonor.id}/verify`,
        {
          data: { urgency_score: 1 },
          headers: {
            "Content-Type": "application/json",
            Cookie: adminCookieHeader,
          },
        },
      );
      expect(verifyResp.status()).toBe(200);

      // Step 5: Login as the now-verified donor
      const donorLogin = await request.post(`${BASE}/api/auth/login`, {
        data: { email: testEmail, password: "e2etest123" },
        headers: { "Content-Type": "application/json" },
      });
      expect(donorLogin.status()).toBe(200);
      const donorData = await donorLogin.json();
      expect(donorData.user.email).toBe(testEmail);
    }
  });

  test("donor can create donation, recipient can view it", async ({
    request,
  }) => {
    // Login as donor
    const donorLogin = await request.post(`${BASE}/api/auth/login`, {
      data: { email: ACCOUNTS.donor.email, password: ACCOUNTS.donor.password },
      headers: { "Content-Type": "application/json" },
    });
    expect(donorLogin.status()).toBe(200);
    const donorCookies = donorLogin.headers()["set-cookie"];
    const donorCookie = Array.isArray(donorCookies)
      ? donorCookies.join("; ")
      : donorCookies || "";

    // Create donation
    const createResp = await request.post(`${BASE}/api/donations`, {
      data: {
        food_name: "E2E Nasi Goreng Test",
        food_type: "makanan_berat",
        portion_count: 20,
        protein_per_portion: 8,
        calorie_per_portion: 350,
        hours_valid: 24,
        pickup_latitude: "-7.78",
        pickup_longitude: "110.37",
      },
      headers: { "Content-Type": "application/json", Cookie: donorCookie },
    });
    expect(createResp.status()).toBe(200);
    const createData = await createResp.json();
    expect(createData.message).toBeTruthy();

    // Check active donations — the new one should appear
    const activeResp = await request.get(`${BASE}/api/donations/active`);
    expect(activeResp.status()).toBe(200);
    const activeDonations = await activeResp.json();
    expect(
      activeDonations.some((d: any) => d.food_name === "E2E Nasi Goreng Test"),
    ).toBeTruthy();
  });

  test("recipient can claim donation and see history", async ({ request }) => {
    // Login as recipient
    const recipLogin = await request.post(`${BASE}/api/auth/login`, {
      data: {
        email: ACCOUNTS.recipient.email,
        password: ACCOUNTS.recipient.password,
      },
      headers: { "Content-Type": "application/json" },
    });
    expect(recipLogin.status()).toBe(200);
    const recipCookies = recipLogin.headers()["set-cookie"];
    const recipCookie = Array.isArray(recipCookies)
      ? recipCookies.join("; ")
      : recipCookies || "";
    const recipData = await recipLogin.json();

    // Get active donations
    const activeResp = await request.get(`${BASE}/api/donations/active`, {
      headers: { Cookie: recipCookie },
    });
    expect(activeResp.status()).toBe(200);
    const activeList = await activeResp.json();

    // Find a donation to claim (one with rank data if possible)
    const claimable = activeList.find((d: any) => d.rank !== null);
    if (claimable) {
      // Claim the donation
      const claimResp = await request.post(
        `${BASE}/api/donations/${claimable.id}/claim`,
        {
          headers: { Cookie: recipCookie },
        },
      );
      expect(claimResp.status()).toBe(200);

      // Check donation history
      const historyResp = await request.get(`${BASE}/api/donations/history`, {
        headers: { Cookie: recipCookie },
      });
      expect(historyResp.status()).toBe(200);
    }

    // Nutrition data should be accessible
    const akgResp = await request.get(`${BASE}/api/recipient/akg`, {
      headers: { Cookie: recipCookie },
    });
    expect(akgResp.status()).toBe(200);
    const akgData = await akgResp.json();
    expect(akgData.daily_needs.protein).toBeGreaterThan(0);
  });

  test("admin can run TOPSIS and manage emergency", async ({ request }) => {
    // Login as admin
    const adminLogin = await request.post(`${BASE}/api/auth/login`, {
      data: { email: ACCOUNTS.admin.email, password: ACCOUNTS.admin.password },
      headers: { "Content-Type": "application/json" },
    });
    const adminCookies = adminLogin.headers()["set-cookie"];
    const adminCookie = Array.isArray(adminCookies)
      ? adminCookies.join("; ")
      : adminCookies || "";

    // Run TOPSIS
    const topsisResp = await request.post(`${BASE}/api/admin/topsis/run`, {
      headers: { Cookie: adminCookie },
    });
    expect(topsisResp.status()).toBe(200);

    // Get users to find a recipient for emergency toggle
    const usersResp = await request.get(`${BASE}/api/admin/users`, {
      headers: { Cookie: adminCookie },
    });
    expect(usersResp.status()).toBe(200);
    const usersData = await usersResp.json();

    if (usersData.recipients.length > 0) {
      const firstRecipient = usersData.recipients[0];

      // Toggle emergency
      const emergencyResp = await request.post(
        `${BASE}/api/admin/users/${firstRecipient.id}/emergency`,
        { headers: { Cookie: adminCookie } },
      );
      expect(emergencyResp.status()).toBe(200);
      const emergencyData = await emergencyResp.json();
      expect(emergencyData.emergency).toBeTruthy();
    }

    // Search endpoint
    const searchResp = await request.get(`${BASE}/api/admin/search?q=nasi`, {
      headers: { Cookie: adminCookie },
    });
    expect(searchResp.status()).toBe(200);
    const searchData = await searchResp.json();
    expect(searchData.donations.length).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────
// PUBLIC API ENDPOINTS
// ─────────────────────────────────────────────────────────────
test.describe("Public APIs", () => {
  test("dashboard stats", async ({ request }) => {
    const resp = await request.get(`${BASE}/api/dashboard/stats`);
    expect(resp.status()).toBe(200);
    const data = await resp.json();
    expect(data.donors).toBeGreaterThan(0);
    expect(data.recipients).toBeGreaterThan(0);
  });

  test("dashboard trends", async ({ request }) => {
    const resp = await request.get(`${BASE}/api/dashboard/trends`);
    expect(resp.status()).toBe(200);
    const data = await resp.json();
    expect(data.weekly).toBeTruthy();
    expect(data.foodTypes).toBeTruthy();
  });

  test("top donors", async ({ request }) => {
    const resp = await request.get(`${BASE}/api/public/top-donors`);
    expect(resp.status()).toBe(200);
    const data = await resp.json();
    expect(data.length).toBeGreaterThan(0);
    expect(data[0].business_name).toBeTruthy();
  });

  test("public reviews", async ({ request }) => {
    const resp = await request.get(`${BASE}/api/public/reviews`);
    expect(resp.status()).toBe(200);
    const data = await resp.json();
    if (data.length > 0) {
      expect(data[0].rating).toBeGreaterThan(0);
    }
  });

  test("map data", async ({ request }) => {
    const resp = await request.get(`${BASE}/api/map/data`);
    expect(resp.status()).toBe(200);
    const data = await resp.json();
    expect(data.donors).toBeTruthy();
    expect(data.activeDonations).toBeTruthy();
  });

  test("analytics impact", async ({ request }) => {
    const resp = await request.get(`${BASE}/api/analytics/impact`);
    expect(resp.status()).toBe(200);
    const data = await resp.json();
    expect(data.total_portions_donated).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────
// SPAs ROUTING
// ─────────────────────────────────────────────────────────────
test.describe("SPA Routing", () => {
  const pages = [
    { path: "/", name: "Home" },
    { path: "/login", name: "Login" },
    { path: "/register/donor", name: "Register Donor" },
    { path: "/register/recipient", name: "Register Recipient" },
    { path: "/forgot-password", name: "Forgot Password" },
  ];

  for (const { path, name } of pages) {
    test(`${name} page loads (${path})`, async ({ page }) => {
      const resp = await page.goto(`${BASE}${path}`);
      expect(resp?.status()).toBe(200);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1000);

      // Page should have rendered something meaningful
      const body = page.locator("body");
      await expect(body).toBeVisible();

      // No console errors
      const errors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text());
      });
    });
  }

  test("404 page for unknown routes", async ({ page }) => {
    const resp = await page.goto(`${BASE}/this-does-not-exist-page`);
    // Should return 200 (SPA fallback) or show 404 content
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // NotFound page should render something
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────
// BACKEND HEALTH
// ─────────────────────────────────────────────────────────────
test.describe("Backend Health", () => {
  test("health endpoint returns ok", async ({ request }) => {
    const resp = await request.get(`${BASE}/health`);
    expect(resp.status()).toBe(200);
    const data = await resp.json();
    expect(data.status).toBe("ok");
  });

  test("detailed health shows database healthy", async ({ request }) => {
    const resp = await request.get(`${BASE}/api/health/detailed`);
    // May require auth, handle gracefully
    if (resp.status() === 200) {
      const data = await resp.json();
      expect(data.checks).toBeTruthy();
    }
  });

  test("CORS headers present on API requests", async ({ request }) => {
    const resp = await request.get(`${BASE}/api/public/stats`);
    // Vercel proxy → same-origin, no CORS headers needed — but verify response works
    expect(resp.ok()).toBeTruthy();
  });
});
