import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <form className="card auth-card" onSubmit={submit}>
        <h2>Forgot password</h2>
        {sent ? (
          <>
            <div className="alert info">
              If an account exists for <strong>{email}</strong>, a reset link is
              on its way. Check your inbox (and spam folder). The link expires in
              1 hour.
            </div>
            <p className="auth-alt">
              <Link to="/login">Back to login</Link>
            </p>
          </>
        ) : (
          <>
            {error && <div className="alert">{error}</div>}
            <p className="muted">
              Enter your email and we'll send you a link to reset your password.
            </p>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button className="btn btn-primary" disabled={busy}>
              {busy ? "Sending..." : "Send reset link"}
            </button>
            <p className="auth-alt">
              Remembered it? <Link to="/login">Back to login</Link>
            </p>
          </>
        )}
      </form>
    </div>
  );
}
