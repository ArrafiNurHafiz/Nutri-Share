import L from "leaflet";

function svgToUrl(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function pinSvg(color: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 42" width="26" height="42">
    <path d="M13 0C5.82 0 0 5.82 0 13c0 9.75 13 25 13 25s13-15.25 13-25C26 5.82 20.18 0 13 0z" fill="${color}" stroke="rgba(0,0,0,.15)" stroke-width="1.5"/>
    <circle cx="13" cy="12" r="5.5" fill="#fff" stroke="rgba(0,0,0,.1)" stroke-width=".5"/>
  </svg>`;
}

L.Icon.Default.mergeOptions({
  iconUrl: svgToUrl(pinSvg("#3388ff")),
  iconRetinaUrl: svgToUrl(pinSvg("#3388ff")),
  iconSize: [26, 42],
  iconAnchor: [13, 42],
  popupAnchor: [0, -42],
  shadowUrl: undefined,
});

export const donorIcon = new L.Icon({
  iconUrl: svgToUrl(pinSvg("#2D7A4F")),
  iconSize: [26, 42],
  iconAnchor: [13, 42],
  popupAnchor: [0, -42],
});

export const recipientIcon = new L.Icon({
  iconUrl: svgToUrl(pinSvg("#1565C0")),
  iconSize: [26, 42],
  iconAnchor: [13, 42],
  popupAnchor: [0, -42],
});

export const courierIcon = new L.Icon({
  iconUrl: svgToUrl(pinSvg("#F5A623")),
  iconSize: [26, 42],
  iconAnchor: [13, 42],
  popupAnchor: [0, -42],
});

export const locationIcon = new L.Icon({
  iconUrl: svgToUrl(pinSvg("#E53935")),
  iconSize: [26, 42],
  iconAnchor: [13, 42],
  popupAnchor: [0, -42],
});
