// Routing abstraction.
// Primary: Valhalla (FOSSGIS public server) — keyless and returns genuine
// alternative routes. Fallback: OSRM public server.
// Returns: [{ coords:[[lat,lng]], distance(m), duration(s) }] sorted by time.

const VALHALLA_URL = "https://valhalla1.openstreetmap.de/route";

// Decode a Valhalla-encoded polyline (precision 6) into [lat,lng] points.
function decodePolyline(str, precision = 6) {
  let index = 0,
    lat = 0,
    lng = 0;
  const coords = [];
  const factor = Math.pow(10, precision);
  while (index < str.length) {
    let result = 1,
      shift = 0,
      b;
    do {
      b = str.charCodeAt(index++) - 63 - 1;
      result += b << shift;
      shift += 5;
    } while (b >= 0x1f);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    result = 1;
    shift = 0;
    do {
      b = str.charCodeAt(index++) - 63 - 1;
      result += b << shift;
      shift += 5;
    } while (b >= 0x1f);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    coords.push([lat / factor, lng / factor]);
  }
  return coords;
}

function tripToRoute(trip) {
  const coords = trip.legs.flatMap((leg) => decodePolyline(leg.shape));
  return {
    coords,
    distance: trip.summary.length * 1000, // km -> m
    duration: trip.summary.time, // seconds
  };
}

async function fetchValhalla(from, to) {
  const res = await fetch(VALHALLA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      locations: [
        { lat: from.lat, lon: from.lng },
        { lat: to.lat, lon: to.lng },
      ],
      costing: "auto",
      alternates: 3,
      directions_options: { units: "kilometers" },
    }),
  });
  if (!res.ok) throw new Error(`Valhalla ${res.status}`);
  const data = await res.json();
  const routes = [];
  if (data.trip?.legs?.length) routes.push(tripToRoute(data.trip));
  (data.alternates || []).forEach((a) => {
    if (a.trip?.legs?.length) routes.push(tripToRoute(a.trip));
  });
  return routes;
}

async function fetchOSRM(from, to) {
  const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson&alternatives=3`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`OSRM ${res.status}`);
  const data = await res.json();
  return (data.routes || [])
    .filter((r) => r?.geometry?.coordinates?.length)
    .map((r) => ({
      coords: r.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
      distance: r.distance,
      duration: r.duration,
    }));
}

// Returns a sorted, de-duplicated list of routes.
export async function getRoutes(from, to) {
  let routes = [];
  try {
    routes = await fetchValhalla(from, to);
  } catch {
    routes = [];
  }
  if (!routes.length) {
    try {
      routes = await fetchOSRM(from, to);
    } catch {
      routes = [];
    }
  }
  if (!routes.length) return [];

  routes.sort((a, b) => a.duration - b.duration);
  const unique = [];
  for (const r of routes) {
    const dup = unique.some((u) => Math.abs(u.distance - r.distance) < 300);
    if (!dup) unique.push(r);
    if (unique.length >= 4) break;
  }
  return unique;
}
