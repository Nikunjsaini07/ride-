import { useEffect, useState } from "react";
import api from "../api";
import RideCard from "../components/RideCard.jsx";
import { useToast } from "../context/ToastContext.jsx";

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

  return (
    <div>
      <h2>My Requests</h2>
      {requests.length === 0 && (
        <p className="muted">You haven't requested any rides yet.</p>
      )}

      <div className="ride-list">
        {requests.map((q) =>
          q.ride ? (
            <RideCard key={q._id} ride={q.ride}>
              <span className={`badge badge-${q.status}`}>
                {statusLabel[q.status] || q.status}
              </span>
              {q.status === "accepted" && q.ride.driver && (
                <span className="muted">
                  Contact: {q.ride.driver.name}
                  {q.ride.driver.phone ? ` · ${q.ride.driver.phone}` : ""}
                </span>
              )}
              {(q.status === "pending" || q.status === "accepted") && (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => cancel(q._id)}
                >
                  Cancel request
                </button>
              )}
            </RideCard>
          ) : null
        )}
      </div>
    </div>
  );
}
