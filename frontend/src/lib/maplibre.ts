// Dynamic MapLibre GL loader via CDN (Zero build-time NPM dependency requirement)
export async function getMapLibre(): Promise<any> {
  if (typeof window !== "undefined" && (window as any).maplibregl) {
    return (window as any).maplibregl;
  }

  return new Promise((resolve, reject) => {
    if (typeof document === "undefined") return reject(new Error("SSR not supported"));

    // Ensure CSS is loaded
    if (!document.getElementById("maplibre-gl-css")) {
      const link = document.createElement("link");
      link.id = "maplibre-gl-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/maplibre-gl@5.2.0/dist/maplibre-gl.css";
      document.head.appendChild(link);
    }

    // Load JS
    const existingScript = document.getElementById("maplibre-gl-js");
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve((window as any).maplibregl));
      existingScript.addEventListener("error", reject);
      return;
    }

    const script = document.createElement("script");
    script.id = "maplibre-gl-js";
    script.src = "https://unpkg.com/maplibre-gl@5.2.0/dist/maplibre-gl.js";
    script.async = true;
    script.onload = () => {
      resolve((window as any).maplibregl);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}
