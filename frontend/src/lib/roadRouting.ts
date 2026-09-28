// Real Road Routing Service using OSRM (Open Source Routing Machine)
// Supports direct routes and 2-way Round-Trip (Recipient -> Donor -> Recipient)

export interface RouteResult {
  coordinates: [number, number][]; // [longitude, latitude]
  distanceKm: number;
  durationMin: number;
}

export interface RoundTripRouteResult {
  coordinates: [number, number][]; // [longitude, latitude] full round trip
  outboundCoordinates: [number, number][]; // Leg 1: Recipient -> Donor
  returnCoordinates: [number, number][];   // Leg 2: Donor -> Recipient
  midpointIndex: number; // index where courier reaches Donor
  totalDistanceKm: number;
  totalDurationMin: number;
  outboundDistanceKm: number;
  outboundDurationMin: number;
  returnDistanceKm: number;
  returnDurationMin: number;
}

function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((6371 * c).toFixed(1));
}

export async function fetchRoadRoute(
  start: [number, number], // [lat, lng]
  end: [number, number]    // [lat, lng]
): Promise<RouteResult> {
  const startLat = start[0];
  const startLng = start[1];
  const endLat = end[0];
  const endLng = end[1];

  const fallbackLine: [number, number][] = [
    [startLng, startLat],
    [endLng, endLat],
  ];

  const fallbackDist = haversineDistanceKm(startLat, startLng, endLat, endLng);
  const fallbackDur = Math.max(3, Math.round(fallbackDist * 2.5));

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("OSRM routing unavailable");

    const data = await res.json();
    if (data.code === "Ok" && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      return {
        coordinates: route.geometry.coordinates,
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

export async function fetchRoundTripRoadRoute(
  recipient: [number, number], // [lat, lng]
  donor: [number, number]       // [lat, lng]
): Promise<RoundTripRouteResult> {
  const recipLat = recipient[0];
  const recipLng = recipient[1];
  const donorLat = donor[0];
  const donorLng = donor[1];

  const oneWayDist = haversineDistanceKm(recipLat, recipLng, donorLat, donorLng);
  const oneWayDur = Math.max(3, Math.round(oneWayDist * 2.5));

  const fallbackCoords: [number, number][] = [
    [recipLng, recipLat],
    [donorLng, donorLat],
    [recipLng, recipLat],
  ];

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${recipLng},${recipLat};${donorLng},${donorLat};${recipLng},${recipLat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("OSRM round trip unavailable");

    const data = await res.json();
    if (data.code === "Ok" && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const coords: [number, number][] = route.geometry.coordinates;

      // Find midpoint index closest to donor position
      let closestIdx = 0;
      let minD = Infinity;
      for (let i = 0; i < coords.length; i++) {
        const dLng = coords[i][0] - donorLng;
        const dLat = coords[i][1] - donorLat;
        const distSq = dLng * dLng + dLat * dLat;
        if (distSq < minD) {
          minD = distSq;
          closestIdx = i;
        }
      }

      // If closest index is right at boundary, ensure we have reasonable split
      if (closestIdx === 0 && coords.length > 2) {
        closestIdx = Math.floor(coords.length / 2);
      }

      const legs = route.legs || [];
      const leg1Dist = legs[0] ? Number((legs[0].distance / 1000).toFixed(1)) : oneWayDist;
      const leg1Dur = legs[0] ? Math.max(1, Math.round(legs[0].duration / 60)) : oneWayDur;
      const leg2Dist = legs[1] ? Number((legs[1].distance / 1000).toFixed(1)) : oneWayDist;
      const leg2Dur = legs[1] ? Math.max(1, Math.round(legs[1].duration / 60)) : oneWayDur;

      return {
        coordinates: coords,
        outboundCoordinates: coords.slice(0, closestIdx + 1),
        returnCoordinates: coords.slice(closestIdx),
        midpointIndex: closestIdx,
        totalDistanceKm: Number((route.distance / 1000).toFixed(1)),
        totalDurationMin: Math.max(2, Math.round(route.duration / 60)),
        outboundDistanceKm: leg1Dist,
        outboundDurationMin: leg1Dur,
        returnDistanceKm: leg2Dist,
        returnDurationMin: leg2Dur,
      };
    }
  } catch (err) {
    console.warn("OSRM round trip fallback used:", err);
  }

  return {
    coordinates: fallbackCoords,
    outboundCoordinates: [
      [recipLng, recipLat],
      [donorLng, donorLat],
    ],
    returnCoordinates: [
      [donorLng, donorLat],
      [recipLng, recipLat],
    ],
    midpointIndex: 1,
    totalDistanceKm: Number((oneWayDist * 2).toFixed(1)),
    totalDurationMin: oneWayDur * 2,
    outboundDistanceKm: oneWayDist,
    outboundDurationMin: oneWayDur,
    returnDistanceKm: oneWayDist,
    returnDurationMin: oneWayDur,
  };
}
