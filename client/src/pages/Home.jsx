import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Home() {
  const { user } = useAuth();
  return (
    <div className="home">
      <section className="hero">
        <span className="hero-badge">
          <span className="dot" />
          By students, for students · Shobhit University, Gangoh
        </span>
        <h1>
          Share a bike ride with <span className="grad">fellow students</span>
        </h1>
        <p>
          Heading to or from campus? Match with a student riding your way, hop
          on, and split the trip — no fares, no fuss. Just students helping
          students get around Gangoh.
        </p>
        <div className="hero-actions">
          <Link to="/find" className="btn btn-primary btn-lg">
            🔍 Find a Ride
          </Link>
          {user ? (
            <Link to="/offer" className="btn btn-outline btn-lg">
              🛵 Offer a Ride
            </Link>
          ) : (
            <Link to="/register" className="btn btn-outline btn-lg">
              Sign Up Free
            </Link>
          )}
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <div className="num">₹0</div>
            <div className="lbl">No fares, ever</div>
          </div>
          <div className="hero-stat">
            <div className="num">15+</div>
            <div className="lbl">Towns covered</div>
          </div>
          <div className="hero-stat">
            <div className="num">2-min</div>
            <div className="lbl">To post a ride</div>
          </div>
        </div>
      </section>

      <section>
        <div className="section-head">
          <span className="eyebrow">How it works</span>
          <h2>Three steps to your next ride</h2>
        </div>
        <div className="steps">
          <div className="card step">
            <div className="step-num">1</div>
            <h3>Search your route</h3>
            <p>
              Pick a direction and destination. We match riders heading the same
              way — including nearby stops along the road.
            </p>
          </div>
          <div className="card step">
            <div className="step-num">2</div>
            <h3>Request to join</h3>
            <p>
              Found a ride you like? Send a quick request to the student riding
              the bike and wait for a thumbs up.
            </p>
          </div>
          <div className="card step">
            <div className="step-num">3</div>
            <h3>Ride together</h3>
            <p>
              Once accepted, you get their contact, meet up, and ride. Rate each
              other afterwards to keep the community trusted.
            </p>
          </div>
        </div>
      </section>

      <section className="home-cta">
        <h2>Got a bike and an empty seat?</h2>
        <p>
          Turn your daily commute into someone else's lift. Post your ride in
          under two minutes.
        </p>
        <Link
          to={user ? "/offer" : "/register"}
          className="btn btn-primary btn-lg"
        >
          {user ? "🛵 Offer a Ride" : "Get Started — It's Free"}
        </Link>
      </section>
    </div>
  );
}
