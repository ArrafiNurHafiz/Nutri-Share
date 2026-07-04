export const api = {
  fetchJSON: async (url: string, options?: RequestInit) => {
    const res = await fetch(url, options);
    if (!res.ok) {
      let message = "Something went wrong";
      try { const data = await res.json(); message = data.message || message; } catch {}
      throw new Error(message);
    }
    return res.json();
  }
};
