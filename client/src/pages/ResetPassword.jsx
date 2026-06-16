import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import PasswordInput from "../components/PasswordInput.jsx";
import { motion } from "framer-motion";
import { Lock, KeyRound } from "lucide-react";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({ password: "", confirm: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const pageVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } }
  };

  if (!token) {
    return (
      <div className="auth-wrap">
        <motion.div className="card auth-card" initial="hidden" animate="visible" variants={pageVariants}>
          <h2>Invalid link</h2>
          <div className="alert">
            This reset link is missing its token. Please request a new one.
          </div>
          <p className="auth-alt">
            <Link to="/forgot-password">Request a new link</Link>
          </p>
        </motion.div>
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
    <motion.div className="auth-wrap" initial="hidden" animate="visible" variants={pageVariants}>
      <form className="card auth-card" onSubmit={submit}>
        <h2 style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <KeyRound size={22} style={{ color: 'var(--primary)' }} />
          <span>Set a new password</span>
        </h2>
        {error && <div className="alert">{error}</div>}
        
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <Lock size={14} />
          <span>New password</span>
        </label>
        <PasswordInput
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <Lock size={14} />
          <span>Confirm new password</span>
        </label>
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
    </motion.div>
  );
}
