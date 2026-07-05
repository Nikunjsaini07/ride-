import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import RideCard from "../components/RideCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import useMeta from "../useMeta";
import { motion, AnimatePresence } from "framer-motion";
import { Search, RotateCcw, Filter, MapPin, Calendar } from "lucide-react";

const emptyFilters = { direction: "", place: "", date: "", nearby: true };

export default function FindRides() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const meta = useMeta();
  const [filters, setFilters] = useState(emptyFilters);
  const [rides, setRides] = useState([]);
  const [pageInfo, setPageInfo] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(null);

  const search = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (filters.direction) params.direction = filters.direction;
      if (filters.place) {
        params.place = filters.place;
        params.nearby = filters.nearby;
      }
      if (filters.date) params.date = filters.date;
      const res = await api.get("/rides/search", { params });
      setRides(res.data.rides);
      setPageInfo({
        page: res.data.page,
        totalPages: res.data.totalPages,
        total: res.data.total,
      });
    } catch {
      toast.error("Could not load rides.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    search(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const join = async (rideId) => {
    if (!user) return navigate("/login");
    setJoining(rideId);
    try {
      await api.post("/requests", { rideId });
      toast.success("Request sent! Track it under 'My Requests'.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not send request.");
    } finally {
      setJoining(null);
    }
  };

  const reset = () => {
    setFilters(emptyFilters);
    setTimeout(() => search(1), 0);
  };

  const pageVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } }
  };

  const listVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={pageVariants}>
      <h2>Find a Ride</h2>
      <div className="card filters">
        <div className="filter-grid">
          <div>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={14} />
              <span>Direction</span>
            </label>
            <select
              value={filters.direction}
              onChange={(e) =>
                setFilters({ ...filters, direction: e.target.value })
              }
            >
              <option value="">Any</option>
              <option value="FROM_HUB">Campus → Town</option>
              <option value="TO_HUB">Town → Campus</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={14} />
              <span>Destination</span>
            </label>
            <select
              value={filters.place}
              onChange={(e) => setFilters({ ...filters, place: e.target.value })}
            >
              <option value="">Any</option>
              {meta.destinations.map((d) => (
                <option key={d.name} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} />
              <span>Date</span>
            </label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            />
          </div>
          <div className="filter-check">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={filters.nearby}
                onChange={(e) =>
                  setFilters({ ...filters, nearby: e.target.checked })
                }
              />
              Include nearby stops on the route
            </label>
          </div>
        </div>
        <div className="filter-actions">
          <button className="btn btn-primary" onClick={() => search(1)}>
            <Search size={16} />
            <span>Search</span>
          </button>
          <button className="btn btn-ghost" onClick={reset}>
            <RotateCcw size={16} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            className="ride-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="card ride-card skeleton-card" />
            <div className="card ride-card skeleton-card" />
            <div className="card ride-card skeleton-card" />
          </motion.div>
        ) : rides.length === 0 ? (
          <motion.div
            key="empty"
            className="empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p style={{ fontSize: '1.1rem', fontWeight: '600' }}>No rides match your search.</p>
            <p className="muted">
              Try a different date, switch direction, or keep "nearby stops" on.
            </p>
            {user && (
              <button className="btn btn-outline" onClick={() => navigate("/offer")}>
                Offer a ride instead
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial="hidden"
            animate="visible"
            variants={listVariants}
          >
            <p className="muted result-count">
              {pageInfo.total} ride{pageInfo.total !== 1 ? "s" : ""} found
            </p>
            <div className="ride-list">
              {rides
                .filter((ride) => new Date(ride.departureTime) >= new Date(Date.now() - 5 * 60 * 1000))
                .map((ride) => {
                const isMine = user && ride.driver?._id === user._id;
                const seatsLeft = ride.seatsLeft ?? ride.seats - ride.seatsTaken;
                return (
                  <motion.div key={ride._id} variants={cardVariants}>
                    <RideCard ride={ride}>
                      {isMine ? (
                        <span className="muted" style={{ fontWeight: '600', fontSize: '0.9rem' }}>Your ride</span>
                      ) : (
                        <button
                          className="btn btn-primary"
                          disabled={seatsLeft <= 0 || joining === ride._id}
                          onClick={() => join(ride._id)}
                        >
                          {seatsLeft <= 0
                            ? "Full"
                            : joining === ride._id
                            ? "Sending…"
                            : "Request to Join"}
                        </button>
                      )}
                    </RideCard>
                  </motion.div>
                );
              })}
            </div>

            {pageInfo.totalPages > 1 && (
              <div className="pagination">
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={pageInfo.page <= 1}
                  onClick={() => search(pageInfo.page - 1)}
                >
                  ← Prev
                </button>
                <span className="muted" style={{ fontWeight: '600' }}>
                  Page {pageInfo.page} of {pageInfo.totalPages}
                </span>
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={pageInfo.page >= pageInfo.totalPages}
                  onClick={() => search(pageInfo.page + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
