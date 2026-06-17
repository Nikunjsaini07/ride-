import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import useMeta, { findDestination } from "../useMeta";
import RouteMap from "../components/RouteMap.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { motion } from "framer-motion";
import { Bike, Navigation, MapPin, Calendar, FileText, CheckCircle2 } from "lucide-react";

export default function OfferRide() {
  const navigate = useNavigate();
  const toast = useToast();
  const meta = useMeta();
  const { user } = useAuth();
  const [form, setForm] = useState({
    direction: "FROM_HUB",
    place: "",
    departureTime: "",
    note: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);

  // Reset the chosen route whenever the trip endpoints change.
  const resetRoute = () => {
    setSelectedRoute(null);
    setInfo(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.place || !form.departureTime) {
      setError("Please choose a destination and departure time.");
      return;
    }
    setBusy(true);
    try {
      const payload = {
        ...form,
        departureTime: new Date(form.departureTime).toISOString(),
      };
      if (selectedRoute?.coords?.length) {
        payload.route = {
          distance: selectedRoute.distance,
          duration: selectedRoute.duration,
          geometry: selectedRoute.coords,
        };
      }
      await api.post("/rides", payload);
      toast.success("Ride posted!");
      navigate("/my-rides");
    } catch (err) {
      setError(err.response?.data?.message || "Could not create ride.");
    } finally {
      setBusy(false);
    }
  };

  const pageVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } }
  };

  if (!user?.hasBike) {
    return (
      <motion.div className="auth-wrap" initial="hidden" animate="visible" variants={pageVariants}>
        <div className="card auth-card" style={{ textAlign: "center", padding: "40px 24px" }}>
          <div style={{
            display: "inline-flex",
            padding: "16px",
            borderRadius: "50%",
            background: "var(--warn-glow)",
            color: "var(--accent)",
            marginBottom: "20px",
            border: "2px solid var(--border)",
            boxShadow: "2px 2px 0px var(--border)"
          }}>
            <Bike size={44} />
          </div>
          <h2>Bike Required</h2>
          <p className="muted" style={{ marginBottom: "24px", maxWidth: "380px", marginLeft: "auto", marginRight: "auto" }}>
            You haven't registered a bike on your profile yet. Only users with a bike can offer rides to others.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate("/profile")}
            style={{ width: "100%", justifyContent: "center" }}
          >
            Go to Profile to Add Bike
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div className="auth-wrap" initial="hidden" animate="visible" variants={pageVariants}>
      <form className="card auth-card wide" onSubmit={submit}>
        <h2 style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <Bike size={24} style={{ color: 'var(--primary)' }} />
          <span>Offer a Ride</span>
        </h2>
        <p className="muted">You're riding the bike. One pillion seat available.</p>
        {error && <div className="alert">{error}</div>}

        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <Navigation size={14} />
          <span>Direction</span>
        </label>
        <select
          value={form.direction}
          onChange={(e) => {
            setForm({ ...form, direction: e.target.value });
            resetRoute();
          }}
        >
          <option value="FROM_HUB">Campus → Town</option>
          <option value="TO_HUB">Town → Campus</option>
        </select>

        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <MapPin size={14} />
          <span>{form.direction === "FROM_HUB" ? "Going to" : "Coming from"}</span>
        </label>
        <select
          value={form.place}
          onChange={(e) => {
            setForm({ ...form, place: e.target.value });
            resetRoute();
          }}
          required
        >
          <option value="">Select destination</option>
          {meta.destinations.map((d) => (
            <option key={d.name} value={d.name}>
              {d.name}
            </option>
          ))}
        </select>

        {(() => {
          const dest = findDestination(meta, form.place);
          const hub = meta.hubCoords;
          if (!dest || !hub) return null;
          const hubPoint = { lat: hub.lat, lng: hub.lng, label: meta.hub };
          const destPoint = { lat: dest.lat, lng: dest.lng, label: form.place };
          const mFrom = form.direction === "FROM_HUB" ? hubPoint : destPoint;
          const mTo = form.direction === "FROM_HUB" ? destPoint : hubPoint;
          return (
            <div className="map-preview">
              {info && (
                <div className="map-modal-info" style={{ marginTop: '0', marginBottom: '12px' }}>
                  <span>📏 {(info.distance / 1000).toFixed(1)} km</span>
                  <span>⏱️ ~{Math.round(info.duration / 60)} min by road</span>
                  {selectedRoute && (
                    <span className="route-chosen">
                      <CheckCircle2 size={14} />
                      <span>Route selected</span>
                    </span>
                  )}
                </div>
              )}
              <RouteMap
                from={mFrom}
                to={mTo}
                height={380}
                selectable
                onInfo={setInfo}
                onSelect={setSelectedRoute}
              />
            </div>
          );
        })()}

        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={14} />
          <span>Departure time</span>
        </label>
        <input
          type="datetime-local"
          value={form.departureTime}
          onChange={(e) => setForm({ ...form, departureTime: e.target.value })}
          required
        />

        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <FileText size={14} />
          <span>Note (optional)</span>
        </label>
        <textarea
          rows="3"
          maxLength="280"
          placeholder="e.g. Leaving from main gate, can wait 5 min"
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
        />

        <button className="btn btn-primary" disabled={busy}>
          {busy ? "Posting..." : "Post Ride"}
        </button>
      </form>
    </motion.div>
  );
}
