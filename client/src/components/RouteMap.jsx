import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Polyline,
  Tooltip,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getRoutes } from "../routing";

const fmtKm = (m) => `${(m / 1000).toFixed(1)} km`;
const fmtMin = (s) => {
  const mins = Math.round(s / 60);
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)} h ${mins % 60} min`;
};

// Accurate labels: routes are sorted by time, so index 0 is the fastest.
// The route with the least distance is the shortest.
function routeLabel(routes, i) {
  let minDistIdx = 0;
  routes.forEach((r, idx) => {
    if (r.distance < routes[minDistIdx].distance) minDistIdx = idx;
  });
  if (i === 0) return "Fastest";
  if (i === minDistIdx) return "Shortest";
  return `Alternative ${i}`;
}

// Fits the map view once per signature change (not on every render).
function FitBounds({ points, sig }) {
  const map = useMap();
  useEffect(() => {
    if (points && points.length > 1) {
      map.fitBounds(points, { padding: [40, 40] });
      setTimeout(() => map.invalidateSize(), 150);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig]);
  return null;
}

// Route map on OpenStreetMap tiles.
// - selectable: show route-option buttons and let the user pick.
// - onInfo: fires with {distance,duration} of the active route.
// - onSelect: fires with the full active route {coords,distance,duration}.
// - fixedRoute: render this pre-saved route instead of fetching.
export default function RouteMap({
  from,
  to,
  height = 200,
  onInfo,
  onSelect,
  selectable = false,
  fixedRoute = null,
}) {
  const [routes, setRoutes] = useState(fixedRoute ? [fixedRoute] : []);
  const [selected, setSelected] = useState(0);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!from || !to || fixedRoute) return;
    let cancelled = false;
    setRoutes([]);
    setSelected(0);
    setFailed(false);
    setLoading(true);

    getRoutes(from, to)
      .then((list) => {
        if (cancelled) return;
        if (list.length) {
          setRoutes(list);
          onInfo?.({ distance: list[0].distance, duration: list[0].duration });
          onSelect?.(list[0]);
        } else {
          setFailed(true);
        }
      })
      .catch(() => !cancelled && setFailed(true))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from?.lat, from?.lng, to?.lat, to?.lng, fixedRoute]);

  const pick = (i) => {
    setSelected(i);
    onInfo?.({ distance: routes[i].distance, duration: routes[i].duration });
    onSelect?.(routes[i]);
  };

  if (!from || !to) return null;

  const direct = [
    [from.lat, from.lng],
    [to.lat, to.lng],
  ];
  const activeCoords = routes[selected]?.coords || direct;
  const sig = routes.length ? `routes-${routes.length}-${selected}` : "direct";

  return (
    <div className="route-map-wrap">
      {selectable && routes.length > 1 && (
        <div className="route-options">
          <span className="route-options-label">
            {routes.length} ways found — pick the one you'll take:
          </span>
          <div className="route-options-row">
            {routes.map((r, i) => (
              <button
                key={i}
                type="button"
                className={`route-option ${i === selected ? "active" : ""}`}
                onClick={() => pick(i)}
              >
                <span className="route-option-title">{routeLabel(routes, i)}</span>
                <span className="route-option-meta">
                  {fmtKm(r.distance)} · {fmtMin(r.duration)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="route-map" style={{ height }}>
        <MapContainer
          bounds={direct}
          boundsOptions={{ padding: [40, 40] }}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            subdomains="abc"
            maxZoom={19}
          />

          {/* faded unselected alternatives — only while choosing (Offer a Ride) */}
          {selectable &&
            routes.map((r, i) =>
              i === selected ? null : (
                <Polyline
                  key={`alt-${i}`}
                  positions={r.coords}
                  pathOptions={{ color: "#94a3b8", weight: 5, opacity: 0.55 }}
                  eventHandlers={{ click: () => pick(i) }}
                />
              )
            )}

          {/* selected route: casing + line */}
          <Polyline
            positions={activeCoords}
            pathOptions={{ color: "#1e3a8a", weight: 9, opacity: 0.5 }}
          />
          <Polyline
            positions={activeCoords}
            pathOptions={{
              color: "#2b6fff",
              weight: 5,
              dashArray: routes.length ? null : "8 8",
            }}
          />

          <FitBounds points={activeCoords} sig={sig} />

          <CircleMarker
            center={[from.lat, from.lng]}
            radius={9}
            pathOptions={{ color: "#fff", weight: 2, fillColor: "#2dd4a7", fillOpacity: 1 }}
          >
            <Tooltip permanent direction="top">
              {from.label || "Start"}
            </Tooltip>
          </CircleMarker>
          <CircleMarker
            center={[to.lat, to.lng]}
            radius={9}
            pathOptions={{ color: "#fff", weight: 2, fillColor: "#ff5c7c", fillOpacity: 1 }}
          >
            <Tooltip permanent direction="top">
              {to.label || "Destination"}
            </Tooltip>
          </CircleMarker>
        </MapContainer>
        {loading && <div className="route-fallback">Loading routes…</div>}
        {failed && (
          <div className="route-fallback">Direct line (routing unavailable)</div>
        )}
      </div>
    </div>
  );
}
