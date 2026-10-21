import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { apiError } from "../api/client";
import { Brand } from "../components/Header";
import { STORE_NAME } from "../config";
import { useAuth } from "../context/AuthContext";
import { useTitle } from "../hooks/useTitle";

function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="auth">
      <aside className="auth-side on-dark">
        <Brand light />
        <h2>Welcome to {STORE_NAME}</h2>
        <p>Track your orders, save your cart and check out in seconds.</p>
      </aside>
      <div className="auth-card">
        <h1>{title}</h1>
        <p className="muted">{subtitle}</p>
        {children}
        <p className="auth-foot">{footer}</p>
      </div>
    </div>
  );
}

function useAuthForm(action) {
  const navigate = useNavigate();
  const location = useLocation();
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e, args) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    setMessage("");
    try {
      const user = await action(...args);
      navigate(location.state?.from || (user.role === "ADMIN" ? "/admin" : "/"), { replace: true });
    } catch (err) {
      const info = apiError(err);
      setErrors(info.fieldErrors);
      setMessage(info.message);
      setBusy(false);
    }
  }
  return { errors, message, busy, submit };
}

export function Login() {
  useTitle("Log in");
  const { user, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { errors, message, busy, submit } = useAuthForm(login);
  if (user) return <Navigate to="/" replace />;
  return (
    <AuthShell title="Log in" subtitle="Good to see you again." footer={<>New here? <Link to="/register">Create an account</Link></>}>
      <form onSubmit={(e) => submit(e, [email, password])} noValidate>
        <div className="field">
          <label className="field-label" htmlFor="email">Email</label>
          <input id="email" className="input" type="email" autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>
        <div className="field">
          <label className="field-label" htmlFor="password">Password</label>
          <input id="password" className="input" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {errors.password && <p className="field-error">{errors.password}</p>}
        </div>
        {message && <p className="form-error" role="alert">{message}</p>}
        <button className="btn btn--primary btn--lg btn--block" disabled={busy}>{busy ? "Logging in…" : "Log in"}</button>
      </form>
    </AuthShell>
  );
}

export function Register() {
  useTitle("Create account");
  const { user, register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { errors, message, busy, submit } = useAuthForm(register);
  if (user) return <Navigate to="/" replace />;
  return (
    <AuthShell title="Create your account" subtitle="It takes less than a minute." footer={<>Already registered? <Link to="/login">Log in</Link></>}>
      <form onSubmit={(e) => submit(e, [name, email, password])} noValidate>
        <div className="field">
          <label className="field-label" htmlFor="name">Full name</label>
          <input id="name" className="input" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>
        <div className="field">
          <label className="field-label" htmlFor="email">Email</label>
          <input id="email" className="input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>
        <div className="field">
          <label className="field-label" htmlFor="password">Password</label>
          <input id="password" className="input" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <p className="field-hint">At least 6 characters.</p>
          {errors.password && <p className="field-error">{errors.password}</p>}
        </div>
        {message && <p className="form-error" role="alert">{message}</p>}
        <button className="btn btn--primary btn--lg btn--block" disabled={busy}>{busy ? "Creating…" : "Create account"}</button>
      </form>
    </AuthShell>
  );
}
