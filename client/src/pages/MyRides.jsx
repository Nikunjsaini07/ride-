import { useEffect, useState } from "react";
import api from "../api";
import RideCard from "../components/RideCard.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { motion } from "framer-motion";
import { Trash2, CheckCircle2, User, UserCheck, X } from "lucide-react";

export default function MyRides() {
  const toast = useToast();
  const [rides, setRides] = useState([]);
  const [requests, setRequests] = useState([]);

  const load = async () => {
    const [r, req] = await Promise.all([
      api.get("/rides/mine"),
      api.get("/requests/incoming"),
    ]);
    setRides(r.data);
    setRequests(req.data);
  };

  useEffect(() => {
    load();
  }, []);

  const respond = async (id, action) => {
    try {
      await api.put(`/requests/${id}/respond`, { action });
      toast.success(action === "accept" ? "Request accepted." : "Request rejected.");
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed.");
    }
  };

  const cancelRide = async (id) => {
    if (!confirm("Cancel this ride?")) return;
    try {
      await api.delete(`/rides/${id}`);
      toast.success("Ride cancelled.");
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not cancel.");
    }
  };

  const completeRide = async (id) => {
    if (!confirm("Mark this ride as completed? You'll then be able to rate each other."))
      return;
    try {
      await api.put(`/rides/${id}/complete`);
      toast.success("Ride completed. You can now rate from your profile.");
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not complete.");
    }
  };

  const requestsFor = (rideId) =>
    requests.filter((q) => q.ride?._id === rideId && q.status === "pending");

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
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={pageVariants}>
      <h2>My Rides</h2>
      {rides.length === 0 && (
        <p className="muted" style={{ padding: '20px 0' }}>You haven't offered any rides yet.</p>
      )}

      <motion.div className="ride-list" variants={listVariants}>
        {rides.map((ride) => {
          const pending = requestsFor(ride._id);
          return (
            <motion.div key={ride._id} variants={cardVariants}>
              <RideCard ride={ride}>
                {(ride.status === "open" || ride.status === "full") && (
                  <button
                    className="btn btn-ghost"
                    onClick={() => cancelRide(ride._id)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Trash2 size={14} />
                    <span>Cancel ride</span>
                  </button>
                )}
                {ride.passengers?.length > 0 &&
                  ride.status !== "completed" &&
                  ride.status !== "cancelled" && (
                    <button
                      className="btn btn-primary"
                      onClick={() => completeRide(ride._id)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <CheckCircle2 size={14} />
                      <span>Mark as completed</span>
                    </button>
                  )}
                {ride.status === "completed" && (
                  <span className="badge badge-ok" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={12} />
                    <span>Completed</span>
                  </span>
                )}
                {ride.passengers?.length > 0 && (
                  <div className="passengers">
                    <User size={15} style={{ color: 'var(--primary)' }} />
                    <div>
                      <strong>Passenger:</strong>{" "}
                      {ride.passengers
                        .map((p) => `${p.name}${p.phone ? ` (${p.phone})` : ""}`)
                        .join(", ")}
                    </div>
                  </div>
                )}
                {pending.length > 0 && (
                  <div className="req-block">
                    <strong className="req-block-title">Pending requests</strong>
                    {pending.map((q) => (
                      <div key={q._id} className="req-row">
                        <div className="req-row-info">
                          <span className="req-row-name">
                            <User size={14} style={{ color: 'var(--primary)' }} />
                            <span>
                              {q.rider?.name}
                              {q.rider?.phone ? ` · ${q.rider.phone}` : ""}
                            </span>
                          </span>
                          {q.message && <span className="req-row-msg">"{q.message}"</span>}
                        </div>
                        <span className="req-btns">
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => respond(q._id, "accept")}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <UserCheck size={14} />
                            <span>Accept</span>
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => respond(q._id, "reject")}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <X size={14} />
                            <span>Reject</span>
                          </button>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </RideCard>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
