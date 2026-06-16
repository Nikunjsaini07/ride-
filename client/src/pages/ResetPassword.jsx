import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import PasswordInput from "../components/PasswordInput.jsx";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({ password: "", confirm: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!token) {
    return (
      <div className="auth-wrap">
        <div className="card auth-card">
          <h2>Invalid link</h2>
          <div className="alert">
            This reset link is missing its token. Please request a new one.
          </div>
          <p className="auth-alt">
            <Link to="/forgot-password">Request a new link</Link>
          </p>
        </div>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }
    if (form.password !== form.confirm) {
      return setError("Passwords do not match.");
    }
    setBusy(true);
    try {
      const res = await api.post("/auth/reset-password", {
        token,
        password: form.password,
      });
      setSession(res.data.user, res.data.token);
      toast.success("Password reset. You're now logged in.");
      navigate("/find");
    } catch (err) {
      setError(err.response?.data?.message || "Could not reset password.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <form className="card auth-card" onSubmit={submit}>
        <h2>Set a new password</h2>
        {error && <div className="alert">{error}</div>}
        <label>New password</label>
        <PasswordInput
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <label>Confirm new password</label>
        <PasswordInput
          value={form.confirm}
          onChange={(e) => setForm({ ...form, confirm: e.target.value })}
          required
        />
        <button className="btn btn-primary" disabled={busy}>
          {busy ? "Saving..." : "Reset password"}
        </button>
        <p className="auth-alt">
          <Link to="/login">Back to login</Link>
        </p>
      </form>
    </div>
  );
}
