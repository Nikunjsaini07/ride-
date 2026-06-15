// Routing abstraction.
// Primary: OSRM public server — fast, reliable, real road geometry for India.
// Fallback: Valhalla (FOSSGIS) — returns alternative routes when available.
//
// Returns: [{ coords:[[lat,lng]], distance(m), duration(s) }] sorted by time.

// Decode OSRM / Google-style polyline (precision 5).
function decodePolyline5(str) {
  let index = 0, lat = 0, lng = 0;
  const coords = [];
  while (index < str.length) {
    let b, shift = 0, result = 0;
    do { b = str.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;
    shift = 0; result = 0;
    do { b = str.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;
    coords.push([lat / 1e5, lng / 1e5]);
  }
  return coords;
}

// Decode Valhalla-encoded polyline (precision 6).
function decodePolyline6(str) {
  let index = 0, lat = 0, lng = 0;
  const coords = [];
  const factor = 1e6;
  while (index < str.length) {
    let result = 1, shift = 0, b;
    do { b = str.charCodeAt(index++) - 63 - 1; result += b << shift; shift += 5; } while (b >= 0x1f);
    lat += result & 1 ? ~(result >> 1) : result >> 1;
    result = 1; shift = 0;
    do { b = str.charCodeAt(index++) - 63 - 1; result += b << shift; shift += 5; } while (b >= 0x1f);
    lng += result & 1 ? ~(result >> 1) : result >> 1;
    coords.push([lat / factor, lng / factor]);
  }
  return coords;
}

// OSRM: primary — fast, works well in India, real road geometry.
async function fetchOSRM(from, to) {
  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${from.lng},${from.lat};${to.lng},${to.lat}` +
    `?overview=full&geometries=polyline&alternatives=true`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`OSRM ${res.status}`);
  const data = await res.json();
  if (data.code !== "Ok" || !data.routes?.length) throw new Error("OSRM no routes");
  return data.routes.map((r) => ({
    coords: decodePolyline5(r.geometry),
    distance: r.distance,   // meters
    duration: r.duration,   // seconds
  }));
}

// Valhalla: fallback — can return more alternatives.
async function fetchValhalla(from, to) {
  const res = await fetch("https://valhalla1.openstreetmap.de/route", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(10000),
    body: JSON.stringify({
      locations: [
        { lat: from.lat, lon: from.lng },
        { lat: to.lat,   lon: to.lng   },
      ],
      costing: "auto",
      alternates: 2,
      directions_options: { units: "kilometers" },
    }),
  });
  if (!res.ok) throw new Error(`Valhalla ${res.status}`);
  const data = await res.json();
  const results = [];
  const toRoute = (trip) => ({
    coords: trip.legs.flatMap((leg) => decodePolyline6(leg.shape)),
    distance: trip.summary.length * 1000,
    duration: trip.summary.time,
  });
  if (data.trip?.legs?.length) results.push(toRoute(data.trip));
  (data.alternates || []).forEach((a) => {
    if (a.trip?.legs?.length) results.push(toRoute(a.trip));
  });
  return results;
}

// De-duplicate routes that are essentially the same distance (< 500 m diff).
function dedupe(routes) {
  const unique = [];
  for (const r of routes) {
    if (!unique.some((u) => Math.abs(u.distance - r.distance) < 500)) {
      unique.push(r);
    }
    if (unique.length >= 3) break;
  }
  return unique;
}

// Public API. Returns up to 3 routes sorted fastest first.
export async function getRoutes(from, to) {
  // Try OSRM first (reliable for India).
  try {
    const routes = await fetchOSRM(from, to);
    if (routes.length) {
      routes.sort((a, b) => a.duration - b.duration);
      return dedupe(routes);
    }
  } catch { /* fall through */ }

  // Valhalla as fallback.
  try {
    const routes = await fetchValhalla(from, to);
    if (routes.length) {
      routes.sort((a, b) => a.duration - b.duration);
      return dedupe(routes);
    }
  } catch { /* fall through */ }

  return [];
}
