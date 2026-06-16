import { useEffect, useState } from "react";
import api from "../api";
import RideCard from "../components/RideCard.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { motion } from "framer-motion";
import { X, User, Phone } from "lucide-react";

const statusLabel = {
  pending: "Pending",
  accepted: "Accepted ✓",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

export default function MyRequests() {
  const toast = useToast();
  const [requests, setRequests] = useState([]);

  const load = async () => {
    const res = await api.get("/requests/mine");
    setRequests(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const cancel = async (id) => {
    try {
      await api.put(`/requests/${id}/cancel`);
      toast.success("Request cancelled.");
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not cancel.");
    }
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
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={pageVariants}>
      <h2>My Requests</h2>
      {requests.length === 0 && (
        <p className="muted" style={{ padding: '20px 0' }}>You haven't requested any rides yet.</p>
      )}

      <motion.div className="ride-list" variants={listVariants}>
        {requests.map((q) =>
          q.ride ? (
            <motion.div key={q._id} variants={cardVariants}>
              <RideCard ride={q.ride}>
                <span className={`badge badge-${q.status}`} style={{ marginRight: '10px' }}>
                  {statusLabel[q.status] || q.status}
                </span>
                {q.status === "accepted" && q.ride.driver && (
                  <span className="muted" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginRight: '12px', background: 'rgba(255,255,255,0.02)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <User size={13} />
                    <span>{q.ride.driver.name}</span>
                    {q.ride.driver.phone && (
                      <>
                        <span>·</span>
                        <Phone size={13} />
                        <span>{q.ride.driver.phone}</span>
                      </>
                    )}
                  </span>
                )}
                {(q.status === "pending" || q.status === "accepted") && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => cancel(q._id)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <X size={14} />
                    <span>Cancel request</span>
                  </button>
                )}
              </RideCard>
            </motion.div>
          ) : null
        )}
      </motion.div>
    </motion.div>
  );
}
