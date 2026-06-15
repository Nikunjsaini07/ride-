import { useState, useMemo } from "react";
import useMeta, { findDestination } from "../useMeta";
import RouteMap from "./RouteMap.jsx";
import Modal from "./Modal.jsx";
import { StarsDisplay } from "./StarRating.jsx";

const fmtTime = (iso) =>
  new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

const fmtDistance = (m) => `${(m / 1000).toFixed(1)} km`;
const fmtDuration = (s) => {
  const mins = Math.round(s / 60);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  return `${h} h ${mins % 60} min`;
};

const HUB = "Shobhit University, Gangoh";

export default function RideCard({ ride, children }) {
  const meta = useMeta();
  const [showMap, setShowMap] = useState(false);
  const [info, setInfo] = useState(null);

  const from = ride.direction === "FROM_HUB" ? HUB : ride.place;
  const to = ride.direction === "FROM_HUB" ? ride.place : HUB;
  const seatsLeft = ride.seatsLeft ?? ride.seats - ride.seatsTaken;

  const dest = findDestination(meta, ride.place);
  const hub = meta.hubCoords;
  const { mapFrom, mapTo } = useMemo(() => {
    if (!dest || !hub) return { mapFrom: null, mapTo: null };
    const hubPoint = { lat: hub.lat, lng: hub.lng, label: HUB };
    const destPoint = { lat: dest.lat, lng: dest.lng, label: ride.place };
    return ride.direction === "FROM_HUB"
      ? { mapFrom: hubPoint, mapTo: destPoint }
      : { mapFrom: destPoint, mapTo: hubPoint };
  }, [dest, hub, ride.direction, ride.place]);

  // If the driver saved a chosen route, render that exact path.
  const savedRoute = useMemo(() => {
    const r = ride.route;
    if (r && Array.isArray(r.geometry) && r.geometry.length > 1) {
      return { coords: r.geometry, distance: r.distance, duration: r.duration };
    }
    return null;
  }, [ride.route]);

  return (
    <div className="card ride-card">
      <div className="ride-route">
        <span className="ride-place">{from}</span>
        <span className="ride-arrow">→</span>
        <span className="ride-place">{to}</span>
      </div>
      <div className="ride-meta">
        <span>🕒 {fmtTime(ride.departureTime)}</span>
        <span className={`badge ${seatsLeft > 0 ? "badge-ok" : "badge-muted"}`}>
          {seatsLeft > 0 ? `${seatsLeft} seat left` : "Full"}
        </span>
        <span className={`badge badge-status badge-${ride.status}`}>
          {ride.status}
        </span>
      </div>
      {ride.driver && (
        <div className="ride-driver">
          👤 {ride.driver.name}
          {ride.driver.phone ? ` · 📞 ${ride.driver.phone}` : ""}
          {ride.driver.hasBike ? " · 🛵 has bike" : ""}
          {ride.driver.ratingCount > 0 && (
            <span className="inline-stars">
              <StarsDisplay
                value={ride.driver.ratingAvg}
                count={ride.driver.ratingCount}
              />
            </span>
          )}
        </div>
      )}
      {ride.note && <p className="ride-note">"{ride.note}"</p>}

      {mapFrom && (
        <>
          <button
            type="button"
            className="link-btn"
            onClick={() => setShowMap(true)}
          >
            🗺️ Show route
          </button>
          <Modal
            open={showMap}
            onClose={() => setShowMap(false)}
            title={`${from} → ${to}`}
          >
            <div className="map-modal-info">
              <span>🕒 Departs {fmtTime(ride.departureTime)}</span>
              {(info || savedRoute) && (
                <>
                  <span>📏 {fmtDistance((info || savedRoute).distance)}</span>
                  <span>⏱️ ~{fmtDuration((info || savedRoute).duration)} by road</span>
                </>
              )}
              {savedRoute && (
                <span className="route-chosen">✓ Driver's chosen route</span>
              )}
            </div>
            <RouteMap
              from={mapFrom}
              to={mapTo}
              height="60vh"
              onInfo={setInfo}
              selectable={false}
              fixedRoute={savedRoute}
            />
          </Modal>
        </>
      )}

      {children && <div className="ride-actions">{children}</div>}
    </div>
  );
}
