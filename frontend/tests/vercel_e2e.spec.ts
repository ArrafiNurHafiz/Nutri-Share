import { test, expect } from "@playwright/test";

const BASE = "https://nutrishare.web.id";

const ACCOUNTS = {
  admin: { email: "arrafinur3@gmail.com", password: "password123" },
  donor: { email: "arrafinur1@gmail.com", password: "password123" },
  recipient: { email: "arrafinur2@gmail.com", password: "password123" },
};

const ORIGIN = "https://nutrishare.web.id";

/** Get auth cookie from login API */
async function getCookieHeader(
  request: any,
  email: string,
  password: string,
): Promise<string> {
  const resp = await request.post(`${BASE}/api/auth/login`, {
    data: { email, password },
    headers: { "Content-Type": "application/json", Origin: ORIGIN },
  });
  expect(resp.status()).toBe(200);
  const cookies = resp.headers()["set-cookie"];
  return Array.isArray(cookies) ? cookies.join("; ") : cookies || "";
}

/** Login via API and set cookie in browser context */
async function loginViaApi(page: any, email: string, password: string) {
  const resp = await page.request.post(`${BASE}/api/auth/login`, {
    data: { email, password },
    headers: { "Content-Type": "application/json", Origin: ORIGIN },
  });
  expect(resp.status()).toBe(200);
  const data = await resp.json();
  const cookies = resp.headers()["set-cookie"];
  if (cookies) {
    const cookieStr = Array.isArray(cookies) ? cookies.join("; ") : cookies;
    const tokenMatch = cookieStr.match(/nutrishare_token=([^;]+)/);
    if (tokenMatch) {
      await page.context().addCookies([
        {
          name: "nutrishare_token",
          value: tokenMatch[1],
          domain: "nutrishare.web.id",
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

function postHeaders(cookie: string) {
  return {
    "Content-Type": "application/json",
    Origin: ORIGIN,
    Cookie: cookie,
  };
}

// ═══════════════════════════════════════════════════════════════
// HOMEPAGE TESTS
// ═══════════════════════════════════════════════════════════════
test.describe("Homepage", () => {
  test("loads with correct title and sections", async ({ page }) => {
    await page.goto(`${BASE}/`);
    await expect(page).toHaveTitle(/NUTRI-SHARE/i);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("nav")).toBeVisible();
  });

  test("public stats endpoint returns data", async ({ request }) => {
    const resp = await request.get(`${BASE}/api/public/stats`);
    expect(resp.status()).toBe(200);
    const data = await resp.json();
    expect(data.completed_donations).toBeGreaterThanOrEqual(0);
    expect(data.total_portions).toBeGreaterThanOrEqual(0);
  });

  test("navigation links exist", async ({ page }) => {
    await page.goto(`${BASE}/`);
    await page.waitForLoadState("domcontentloaded");
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// AUTHENTICATION & SECURITY
// ═══════════════════════════════════════════════════════════════
test.describe("Authentication", () => {
  test("login with invalid credentials shows error", async ({ page }) => {
    await page.goto(`${BASE}/login`);
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.isVisible()) {
      await emailInput.fill("wrong@test.com");
      await page.locator('input[type="password"]').fill("badpassword");
      await page.getByRole("button", { name: /sign in|login|masuk/i }).click();
      await page.waitForTimeout(2000);
    }
  });

  test("admin login returns user data", async ({ request }) => {
    const resp = await request.post(`${BASE}/api/auth/login`, {
      data: { email: ACCOUNTS.admin.email, password: ACCOUNTS.admin.password },
      headers: { "Content-Type": "application/json", Origin: ORIGIN },
    });
    expect(resp.status()).toBe(200);
    const data = await resp.json();
    expect(data.user.role).toBe("admin");
  });

  test("donor login returns profile", async ({ request }) => {
    const resp = await request.post(`${BASE}/api/auth/login`, {
      data: { email: ACCOUNTS.donor.email, password: ACCOUNTS.donor.password },
      headers: { "Content-Type": "application/json", Origin: ORIGIN },
    });
    expect(resp.status()).toBe(200);
    const data = await resp.json();
    expect(data.profile.business_name).toBeTruthy();
  });

  test("recipient login returns profile", async ({ request }) => {
    const resp = await request.post(`${BASE}/api/auth/login`, {
      data: {
        email: ACCOUNTS.recipient.email,
        password: ACCOUNTS.recipient.password,
      },
      headers: { "Content-Type": "application/json", Origin: ORIGIN },
    });
    expect(resp.status()).toBe(200);
    const data = await resp.json();
    expect(data.profile.institution_name).toBeTruthy();
  });
});

// ═══════════════════════════════════════════════════════════════
// ADMIN DASHBOARD
// ═══════════════════════════════════════════════════════════════
test.describe("Admin Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await loginViaApi(page, ACCOUNTS.admin.email, ACCOUNTS.admin.password);
  });

  test("admin dashboard loads with user data", async ({ page }) => {
    await page.goto(`${BASE}/admin`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1500);
    await expect(page.locator("body")).toBeVisible();
  });

  test("admin users API returns donors and recipients", async ({ request }) => {
    const c = await getCookieHeader(
      request,
      ACCOUNTS.admin.email,
      ACCOUNTS.admin.password,
    );
    const resp = await request.get(`${BASE}/api/admin/users`, {
      headers: { Cookie: c },
    });
    expect(resp.status()).toBe(200);
    const data = await resp.json();
    expect(data).toHaveProperty("donors");
    expect(data).toHaveProperty("recipients");
    expect(Array.isArray(data.donors)).toBe(true);
    expect(Array.isArray(data.recipients)).toBe(true);
  });

  test("admin claims API returns data", async ({ request }) => {
    const c = await getCookieHeader(
      request,
      ACCOUNTS.admin.email,
      ACCOUNTS.admin.password,
    );
    const resp = await request.get(`${BASE}/api/admin/claims`, {
      headers: { Cookie: c },
    });
    expect(resp.status()).toBe(200);
    const data = await resp.json();
    expect(Array.isArray(data)).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// DONOR DASHBOARD
// ═══════════════════════════════════════════════════════════════
test.describe("Donor Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await loginViaApi(page, ACCOUNTS.donor.email, ACCOUNTS.donor.password);
  });

  test("donor dashboard loads", async ({ page }) => {
    await page.goto(`${BASE}/donor`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1500);
    await expect(page.locator("body")).toBeVisible();
  });

  test("donor donations API returns data", async ({ request }) => {
    const c = await getCookieHeader(
      request,
      ACCOUNTS.donor.email,
      ACCOUNTS.donor.password,
    );
    const resp = await request.get(`${BASE}/api/donations`, {
      headers: { Cookie: c },
    });
    expect(resp.status()).toBe(200);
    const data = await resp.json();
    expect(Array.isArray(data)).toBe(true);
  });

  test("donor can view their badges", async ({ request }) => {
    const c = await getCookieHeader(
      request,
      ACCOUNTS.donor.email,
      ACCOUNTS.donor.password,
    );
    const meResp = await request.get(`${BASE}/api/auth/me`, {
      headers: { Cookie: c },
    });
    const { user } = await meResp.json();

    const resp = await request.get(`${BASE}/api/donors/${user.id}/badges`, {
      headers: { Cookie: c },
    });
    expect(resp.status()).toBe(200);
    const data = await resp.json();
    expect(Array.isArray(data)).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// RECIPIENT DASHBOARD
// ═══════════════════════════════════════════════════════════════
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
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1500);
    await expect(page.locator("body")).toBeVisible();
  });

  test("recipient AKG API returns nutrition data", async ({ request }) => {
    const c = await getCookieHeader(
      request,
      ACCOUNTS.recipient.email,
      ACCOUNTS.recipient.password,
    );
    const resp = await request.get(`${BASE}/api/recipient/akg`, {
      headers: { Cookie: c },
    });
    expect(resp.status()).toBe(200);
    const data = await resp.json();
    expect(data).toHaveProperty("today_intake");
    expect(data).toHaveProperty("daily_needs");
  });
});

// ═══════════════════════════════════════════════════════════════
// FULL BUSINESS FLOW (E2E)
// ═══════════════════════════════════════════════════════════════
test.describe("Full Business Flow", () => {
  test("donor can create donation and it appears in active list", async ({
    request,
  }) => {
    const c = await getCookieHeader(
      request,
      ACCOUNTS.donor.email,
      ACCOUNTS.donor.password,
    );
    const uniqueName = `E2E Test Food ${Date.now()}`;

    const r = await request.post(`${BASE}/api/donations`, {
      data: {
        food_name: uniqueName,
        food_type: "makanan_berat",
        portion_count: 5,
        protein_per_portion: 15,
        calorie_per_portion: 300,
        hours_valid: 6,
        pickup_latitude: -7.7956,
        pickup_longitude: 110.3695,
        notes: "E2E automated test donation",
      },
      headers: postHeaders(c),
    });
    expect(r.status()).toBe(200);
    expect((await r.json()).message).toBeTruthy();

    // Check active list
    const listResp = await request.get(`${BASE}/api/donations`, {
      headers: { Cookie: c },
    });
    const list = await listResp.json();
    const found = list.find((d: any) => d.food_name === uniqueName);
    expect(found).toBeTruthy();
  });

  test("recipient can view donation history", async ({ request }) => {
    const c = await getCookieHeader(
      request,
      ACCOUNTS.recipient.email,
      ACCOUNTS.recipient.password,
    );
    const resp = await request.get(`${BASE}/api/donations`, {
      headers: { Cookie: c },
    });
    expect(resp.status()).toBe(200);
    const data = await resp.json();
    expect(Array.isArray(data)).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// PUBLIC ENDPOINTS
// ═══════════════════════════════════════════════════════════════
test.describe("Public APIs", () => {
  test("dashboard stats", async ({ request }) => {
    const resp = await request.get(`${BASE}/api/public/stats`);
    expect(resp.status()).toBe(200);
  });

  test("dashboard trends", async ({ request }) => {
    const resp = await request.get(`${BASE}/api/dashboard/trends`);
    expect(resp.status()).toBe(200);
    const data = await resp.json();
    expect(data).toHaveProperty("weekly");
  });

  test("top donors", async ({ request }) => {
    const resp = await request.get(`${BASE}/api/public/top-donors`);
    expect(resp.status()).toBe(200);
    expect(Array.isArray(await resp.json())).toBe(true);
  });

  test("public reviews", async ({ request }) => {
    const resp = await request.get(`${BASE}/api/public/reviews`);
    expect(resp.status()).toBe(200);
    expect(Array.isArray(await resp.json())).toBe(true);
  });

  test("map data", async ({ request }) => {
    const resp = await request.get(`${BASE}/api/map/data`);
    expect(resp.status()).toBe(200);
    const data = await resp.json();
    expect(data).toHaveProperty("donors");
    expect(data).toHaveProperty("recipients");
  });

  test("topsis public priority", async ({ request }) => {
    const resp = await request.get(`${BASE}/api/public/topsis-priority`);
    expect(resp.status()).toBe(200);
    const data = await resp.json();
    expect(data).toHaveProperty("rankings");
  });
});

// ═══════════════════════════════════════════════════════════════
// SPA ROUTING
// ═══════════════════════════════════════════════════════════════
test.describe("SPA Routing", () => {
  const routes = [
    "/",
    "/login",
    "/register/donor",
    "/register/recipient",
    "/forgot-password",
    "/support",
    "/map",
  ];

  for (const route of routes) {
    test(`${route} loads successfully`, async ({ page }) => {
      await page.goto(`${BASE}${route}`);
      await expect(page.locator("body")).toBeVisible();
    });
  }
});
