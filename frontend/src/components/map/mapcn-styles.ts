// MapCN Vector Tile Styles (100% Free, High Resolution, Open Source)
export const MAPCN_STYLES = {
  liberty: {
    id: "liberty",
    name: "Realistis (Liberty)",
    url: "https://tiles.openfreemap.org/styles/liberty",
    description: "Peta realistis dengan detail bangunan 3D, jalan, dan kontur tanah",
  },
  positron: {
    id: "positron",
    name: "Minimalis (Positron)",
    url: "https://tiles.openfreemap.org/styles/positron",
    description: "Tampilan bersih bernuansa terang untuk fokus data",
  },
  bright: {
    id: "bright",
    name: "Vibrant (Bright)",
    url: "https://tiles.openfreemap.org/styles/bright",
    description: "Kontras warna tinggi untuk visibilitas optimal",
  },
  dark: {
    id: "dark",
    name: "Dark Mode",
    url: "https://tiles.openfreemap.org/styles/dark",
    description: "Nuansa gelap elegan untuk malam hari",
  },
};

export type MapStyleKey = keyof typeof MAPCN_STYLES;

export function createCustomMarkerElement(type: "donor" | "recipient" | "donation" | "courier", label?: string): HTMLElement {
  const el = document.createElement("div");
  el.className = "mapcn-marker-container";
  el.style.cursor = "pointer";

  let bgClass = "bg-[#2D7A4F]";
  let ringClass = "ring-emerald-400";
  let iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/></svg>`;

  if (type === "recipient") {
    bgClass = "bg-[#1565C0]";
    ringClass = "ring-blue-400";
    iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`;
  } else if (type === "donation") {
    bgClass = "bg-[#E53935]";
    ringClass = "ring-red-400";
    iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/></svg>`;
  } else if (type === "courier") {
    bgClass = "bg-[#2D7A4F]";
    ringClass = "ring-emerald-400";
    iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><circle cx="7" cy="18" r="2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/></svg>`;
  }

  el.innerHTML = `
    <div style="position: relative; display: flex; align-items: center; justify-content: center;">
      <span style="position: absolute; width: 38px; height: 38px; border-radius: 9999px; background: rgba(45, 122, 79, 0.25); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;" class="${ringClass}"></span>
      <div style="width: 36px; height: 36px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 4px 16px rgba(0,0,0,0.35); border: 2.5px solid white; transition: transform 0.2s;" class="${bgClass} hover:scale-110">
        ${iconSvg}
      </div>
      ${label ? `<span style="position: absolute; bottom: -20px; white-space: nowrap; background: rgba(15,23,42,0.9); color: white; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.2); pointer-events: none; border: 1px solid rgba(255,255,255,0.15);">${label}</span>` : ""}
    </div>
  `;

  return el;
}
