const BASE_URL =
  (typeof import.meta !== "undefined" &&
    (import.meta as any).env?.VITE_API_URL) ||
  "";

function extractErrorMessage(data: any): string {
  if (data?.message) return data.message;
  // FastAPI validation error format: { detail: [{ msg: "..." }] }
  if (data?.detail) {
    if (Array.isArray(data.detail) && data.detail.length > 0) {
      return data.detail[0].msg || "Validation failed";
    }
    return typeof data.detail === "string" ? data.detail : "Validation failed";
  }
  return "Something went wrong";
}

export const api = {
  fetchJSON: async (url: string, options?: RequestInit) => {
    const fullUrl = url.startsWith("/api") ? `${BASE_URL}${url}` : url;
    const res = await fetch(fullUrl, { ...options, credentials: "include" });
    if (!res.ok) {
      let data: any;
      try {
        data = await res.json();
      } catch {
        data = {};
      }
      throw new Error(extractErrorMessage(data));
    }
    return res.json();
  },
};
