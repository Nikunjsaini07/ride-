import { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { StarsDisplay, StarsInput } from "../components/StarRating.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Phone, Bike, Calendar, MessageSquare, ShieldCheck, CheckCircle2 } from "lucide-react";

const HUB = "Shobhit University, Gangoh";

const routeLabel = (ride) => {
  const from = ride.direction === "FROM_HUB" ? HUB : ride.place;
  const to = ride.direction === "FROM_HUB" ? ride.place : HUB;
  return `${from} → ${to}`;
};
const fmt = (iso) => {
  const d = new Date(iso);
  const now = new Date();
  const showYear = d.getFullYear() !== now.getFullYear();
  return d.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    ...(showYear ? { year: "numeric" } : {}),
    hour: "2-digit",
    minute: "2-digit",
  });
};

function RateBox({ ride, onRated }) {
  const toast = useToast();
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!stars) return toast.error("Pick a star rating first.");
    setBusy(true);
    try {
      await api.post("/ratings", { rideId: ride._id, stars, comment });
      toast.success("Rating submitted. Thanks!");
      onRated();
    } catch (e) {
      toast.error(e.response?.data?.message || "Could not submit rating.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rate-box">
      <span>Rate {ride.counterpart?.name}:</span>
      <StarsInput value={stars} onChange={setStars} />
      <input
        className="rate-comment"
        placeholder="Optional comment"
        value={comment}
        maxLength={280}
        onChange={(e) => setComment(e.target.value)}
      />
      <button className="btn btn-primary btn-sm" disabled={busy} onClick={submit}>
        {busy ? "..." : "Submit"}
      </button>
    </div>
  );
}

function HistoryRow({ ride, roleLabel, onRated }) {
  return (
    <div className="history-row">
      <div className="history-main">
        <span className="history-route">{routeLabel(ride)}</span>
        <span className="muted" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
          <Calendar size={12} />
          <span>{roleLabel} · {fmt(ride.departureTime)}</span>
        </span>
        {ride.counterpart && (
          <span className="muted" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
            <User size={12} />
            <span>with {ride.counterpart.name}</span>
          </span>
        )}
      </div>
      {ride.ratedByMe ? (
        <span className="badge badge-ok" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <CheckCircle2 size={12} />
          <span>Rated</span>
        </span>
      ) : ride.canRate ? (
        <RateBox ride={ride} onRated={onRated} />
      ) : (
        <span className="muted small">
          {ride.status === "cancelled" ? "Cancelled" : "—"}
        </span>
      )}
    </div>
  );
}

export default function Profile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState("history");
  const [form, setForm] = useState({
    name: user.name,
    phone: user.phone || "",
    hasBike: user.hasBike,
  });
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState(null);

  const load = async () => {
    const res = await api.get("/profile/me");
    setData(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await api.put("/auth/me", form);
      updateUser(res.data.user);
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update.");
    } finally {
      setBusy(false);
    }
  };

  const pageVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } }
  };

  return (
    <motion.div className="profile" initial="hidden" animate="visible" variants={pageVariants}>
      <div className="card profile-head">
        <div>
          <h2>{user.name}</h2>
          <p className="muted" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Mail size={14} />
            <span>{user.email}</span>
          </p>
          <p className="muted" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
            <Phone size={14} />
            <span>{user.phone || "No phone number"}</span>
            <button
              type="button"
              className="btn-link"
              onClick={() => setTab("edit")}
              style={{ fontSize: '0.82rem', marginLeft: '6px' }}
            >
              (change)
            </button>
          </p>
          <div style={{ marginTop: '8px' }}>
            <StarsDisplay
              value={data?.stats.ratingAvg ?? user.ratingAvg ?? 0}
              count={data?.stats.ratingCount ?? user.ratingCount ?? 0}
            />
          </div>
        </div>
        <div className="profile-stats">
          <div className="stat">
            <span className="stat-num">{data?.stats.offeredCount ?? 0}</span>
            <span className="stat-label">Offered</span>
          </div>
          <div className="stat">
            <span className="stat-num">{data?.stats.joinedCount ?? 0}</span>
            <span className="stat-label">Taken</span>
          </div>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${tab === "history" ? "active" : ""}`}
          onClick={() => setTab("history")}
        >
          History &amp; Ratings
        </button>
        <button
          className={`tab ${tab === "edit" ? "active" : ""}`}
          onClick={() => setTab("edit")}
        >
          Edit Profile
        </button>
      </div>

      <AnimatePresence mode="wait">
        {tab === "history" ? (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <h3>Rides I offered</h3>
            {data?.offered.length ? (
              data.offered.map((r) => (
                <HistoryRow
                  key={r._id}
                  ride={r}
                  roleLabel="as driver"
                  onRated={load}
                />
              ))
            ) : (
              <p className="muted" style={{ padding: '10px 0' }}>No past rides offered yet.</p>
            )}

            <h3>Rides I took</h3>
            {data?.joined.length ? (
              data.joined.map((r) => (
                <HistoryRow
                  key={r._id}
                  ride={r}
                  roleLabel="as passenger"
                  onRated={load}
                />
              ))
            ) : (
              <p className="muted" style={{ padding: '10px 0' }}>No past rides taken yet.</p>
            )}

            <h3>Ratings I received</h3>
            {data?.received.length ? (
              data.received.map((rt) => (
                <div key={rt._id} className="card review">
                  <StarsDisplay value={rt.stars} />
                  <span className="muted" style={{ marginLeft: '10px', fontSize: '0.85rem' }}>from {rt.rater?.name}</span>
                  {rt.comment && <p className="review-text">"{rt.comment}"</p>}
                </div>
              ))
            ) : (
              <p className="muted" style={{ padding: '10px 0' }}>No ratings yet.</p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="edit"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <form className="card auth-card" onSubmit={save} style={{ margin: '0 auto' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} />
                <span>Name</span>
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={14} />
                <span>Email</span>
              </label>
              <input value={user.email} disabled />
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={14} />
                <span>Phone</span>
              </label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={form.hasBike}
                  onChange={(e) => setForm({ ...form, hasBike: e.target.checked })}
                />
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Bike size={15} />
                  I have a bike and can offer rides
                </span>
              </label>
              <button className="btn btn-primary" disabled={busy}>
                {busy ? "Saving..." : "Save"}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
