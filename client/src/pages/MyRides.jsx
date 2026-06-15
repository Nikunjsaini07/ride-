import { useEffect, useState } from "react";
import api from "../api";
import RideCard from "../components/RideCard.jsx";
import { useToast } from "../context/ToastContext.jsx";

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

  const requestsFor = (rideId) =>
    requests.filter((q) => q.ride?._id === rideId && q.status === "pending");

  return (
    <div>
      <h2>My Rides</h2>
      {rides.length === 0 && <p className="muted">You haven't offered any rides yet.</p>}

      <div className="ride-list">
        {rides.map((ride) => {
          const pending = requestsFor(ride._id);
          return (
            <RideCard key={ride._id} ride={ride}>
              {(ride.status === "open" || ride.status === "full") && (
                <button
                  className="btn btn-ghost"
                  onClick={() => cancelRide(ride._id)}
                >
                  Cancel ride
                </button>
              )}
              {ride.passengers?.length > 0 && (
                <div className="passengers">
                  <strong>Passenger:</strong>{" "}
                  {ride.passengers
                    .map((p) => `${p.name}${p.phone ? ` (${p.phone})` : ""}`)
                    .join(", ")}
                </div>
              )}
              {pending.length > 0 && (
                <div className="req-block">
                  <strong>Pending requests</strong>
                  {pending.map((q) => (
                    <div key={q._id} className="req-row">
                      <span>
                        {q.rider?.name}
                        {q.rider?.phone ? ` · ${q.rider.phone}` : ""}
                        {q.message ? ` — "${q.message}"` : ""}
                      </span>
                      <span className="req-btns">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => respond(q._id, "accept")}
                        >
                          Accept
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => respond(q._id, "reject")}
                        >
                          Reject
                        </button>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </RideCard>
          );
        })}
      </div>
    </div>
  );
}
