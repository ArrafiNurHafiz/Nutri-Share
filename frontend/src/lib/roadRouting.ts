// Real Road Routing Service using OSRM (Open Source Routing Machine)
// Returns exact road geometry LineString coordinates like Google Maps

export interface RouteResult {
  coordinates: [number, number][]; // [longitude, latitude]
  distanceKm: number;
  durationMin: number;
}

export async function fetchRoadRoute(
  start: [number, number], // [lat, lng]
  end: [number, number]    // [lat, lng]
): Promise<RouteResult> {
  const startLat = start[0];
  const startLng = start[1];
  const endLat = end[0];
  const endLng = end[1];

  // Fallback straight-line
  const fallbackLine: [number, number][] = [
    [startLng, startLat],
    [endLng, endLat],
  ];

  // Approximate distance (Haversine formula in km)
  const dLat = ((endLat - startLat) * Math.PI) / 180;
  const dLon = ((endLng - startLng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((startLat * Math.PI) / 180) *
      Math.cos((endLat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const fallbackDist = Number((6371 * c).toFixed(1));
  const fallbackDur = Math.max(3, Math.round(fallbackDist * 2.5)); // ~25km/h city avg

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("OSRM routing unavailable");

    const data = await res.json();
    if (data.code === "Ok" && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      return {
        coordinates: route.geometry.coordinates, // Array of [lng, lat]
        distanceKm: Number((route.distance / 1000).toFixed(1)),
        durationMin: Math.max(1, Math.round(route.duration / 60)),
      };
    }
  } catch (err) {
    console.warn("OSRM road routing fallback used:", err);
  }

  return {
    coordinates: fallbackLine,
    distanceKm: fallbackDist,
    durationMin: fallbackDur,
  };
}
