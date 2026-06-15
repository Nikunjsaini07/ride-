import { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { StarsDisplay, StarsInput } from "../components/StarRating.jsx";

const HUB = "Shobhit University, Gangoh";

const routeLabel = (ride) => {
  const from = ride.direction === "FROM_HUB" ? HUB : ride.place;
  const to = ride.direction === "FROM_HUB" ? ride.place : HUB;
  return `${from} → ${to}`;
};
const fmt = (iso) =>
  new Date(iso).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

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
        <span className="muted">
          {roleLabel} · {fmt(ride.departureTime)}
        </span>
        {ride.counterpart && (
          <span className="muted">with {ride.counterpart.name}</span>
        )}
      </div>
      {ride.ratedByMe ? (
        <span className="badge badge-ok">Rated ✓</span>
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

  return (
    <div className="profile">
      <div className="card profile-head">
        <div>
          <h2>{user.name}</h2>
          <p className="muted">{user.email}</p>
          <StarsDisplay
            value={data?.stats.ratingAvg ?? user.ratingAvg ?? 0}
            count={data?.stats.ratingCount ?? user.ratingCount ?? 0}
          />
        </div>
        <div className="profile-stats">
          <div className="stat">
            <span className="stat-num">{data?.stats.offeredCount ?? 0}</span>
            <span className="stat-label">Rides offered</span>
          </div>
          <div className="stat">
            <span className="stat-num">{data?.stats.joinedCount ?? 0}</span>
            <span className="stat-label">Rides taken</span>
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

      {tab === "history" && (
        <div>
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
            <p className="muted">No past rides offered yet.</p>
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
            <p className="muted">No past rides taken yet.</p>
          )}

          <h3>Ratings I received</h3>
          {data?.received.length ? (
            data.received.map((rt) => (
              <div key={rt._id} className="card review">
                <StarsDisplay value={rt.stars} />
                <span className="muted">from {rt.rater?.name}</span>
                {rt.comment && <p className="review-text">"{rt.comment}"</p>}
              </div>
            ))
          ) : (
            <p className="muted">No ratings yet.</p>
          )}
        </div>
      )}

      {tab === "edit" && (
        <form className="card auth-card" onSubmit={save}>
          <label>Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <label>Email</label>
          <input value={user.email} disabled />
          <label>Phone</label>
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
            I have a bike and can offer rides
          </label>
          <button className="btn btn-primary" disabled={busy}>
            {busy ? "Saving..." : "Save"}
          </button>
        </form>
      )}
    </div>
  );
}
