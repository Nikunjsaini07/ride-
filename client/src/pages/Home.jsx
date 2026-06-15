import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Home() {
  const { user } = useAuth();
  return (
    <div className="home">
      <section className="hero">
        <h1>Share a bike ride with fellow students</h1>
        <p>
          Going to or from <strong>Shobhit University, Gangoh</strong>? Find a
          student heading your way, hop on, and split the trip — no fares, just
          students helping students.
        </p>
        <div className="hero-actions">
          <Link to="/find" className="btn btn-primary btn-lg">
            Find a Ride
          </Link>
          {user ? (
            <Link to="/offer" className="btn btn-outline btn-lg">
              Offer a Ride
            </Link>
          ) : (
            <Link to="/register" className="btn btn-outline btn-lg">
              Sign Up Free
            </Link>
          )}
        </div>
      </section>

      <section className="steps">
        <div className="card step">
          <div className="step-num">1</div>
          <h3>Search your route</h3>
          <p>Pick a direction and destination. We match riders on the same route.</p>
        </div>
        <div className="card step">
          <div className="step-num">2</div>
          <h3>Request to join</h3>
          <p>Found a ride? Send a quick request to the student riding the bike.</p>
        </div>
        <div className="card step">
          <div className="step-num">3</div>
          <h3>Ride together</h3>
          <p>Once accepted, you get their contact and meet up. Simple and free.</p>
        </div>
      </section>
    </div>
  );
}
