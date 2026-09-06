import { broadcastMutation } from "./useRealtime";

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
    const result = await res.json();

    // Instant cross-tab real-time synchronization on state modifications
    const method = (options?.method || "GET").toUpperCase();
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      let eventType = "DATA_MUTATION";
      if (url.includes("/claim")) eventType = "CLAIM_CREATED";
      else if (url.includes("/approve")) eventType = "CLAIM_APPROVED";
      else if (url.includes("/arrived")) eventType = "DELIVERY_ARRIVED";
      else if (url.includes("/complete")) eventType = "HANDOVER_COMPLETED";
      else if (url.includes("/donations")) eventType = "DONATION_CREATED";
      else if (url.includes("/emergency")) eventType = "EMERGENCY_STATUS_UPDATED";
      else if (url.includes("/verify")) eventType = "USER_VERIFIED";

      broadcastMutation(eventType, { url, method });
    }

    return result;
  },
};
