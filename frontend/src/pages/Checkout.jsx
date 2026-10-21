import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { OrderApi } from "../api";
import { apiError } from "../api/client";
import EmptyState from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { STATES } from "../config";
import { useTitle } from "../hooks/useTitle";
import { formatINR, PAYMENT_LABEL } from "../utils/format";
import { Summary } from "./Cart";

function Field({ label, name, form, set, errors, ...rest }) {
  return (
    <div className="field">
      <label className="field-label" htmlFor={name}>{label}</label>
      <input id={name} className="input" value={form[name]} onChange={(e) => set(name, e.target.value)} aria-invalid={errors[name] ? "true" : undefined} {...rest} />
      {errors[name] && <p className="field-error">{errors[name]}</p>}
    </div>
  );
}

export default function Checkout() {
  useTitle("Checkout");
  const { user } = useAuth();
  const { cart, refresh } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: user?.name || "", phone: "", addressLine: "", city: "", state: "", pincode: "", paymentMethod: "COD" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  if (cart.items.length === 0 && !busy) {
    return (
      <div className="container page">
        <EmptyState icon="cart" title="Nothing to check out" text="Your cart is empty." action={<Link to="/shop" className="btn btn--primary">Browse products</Link>} />
      </div>
    );
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    setMessage("");
    try {
      const order = await OrderApi.place(form);
      await refresh();
      navigate(`/orders/${order.id}`, { replace: true, state: { placed: true } });
    } catch (err) {
      const info = apiError(err);
      setErrors(info.fieldErrors);
      setMessage(info.message);
      if (info.status === 409) refresh();
      setBusy(false);
    }
  }

  return (
    <div className="container page">
      <h1 className="page-title">Checkout</h1>
      <form className="two-col" onSubmit={submit} noValidate>
        <div className="stack">
          <section className="panel">
            <h2>Delivery address</h2>
            <div className="form-grid">
              <Field label="Full name" name="fullName" form={form} set={set} errors={errors} autoComplete="name" />
              <Field label="Phone number" name="phone" form={form} set={set} errors={errors} inputMode="tel" autoComplete="tel" />
              <div className="span-2"><Field label="Address" name="addressLine" form={form} set={set} errors={errors} autoComplete="street-address" /></div>
              <Field label="City" name="city" form={form} set={set} errors={errors} autoComplete="address-level2" />
              <div className="field">
                <label className="field-label" htmlFor="state">State</label>
                <select id="state" className="select" value={form.state} onChange={(e) => set("state", e.target.value)} aria-invalid={errors.state ? "true" : undefined}>
                  <option value="">Select state</option>
                  {STATES.map((s) => <option key={s}>{s}</option>)}
                </select>
                {errors.state && <p className="field-error">{errors.state}</p>}
              </div>
              <Field label="Pincode" name="pincode" form={form} set={set} errors={errors} inputMode="numeric" maxLength={6} autoComplete="postal-code" />
            </div>
          </section>
          <section className="panel">
            <h2>Payment</h2>
            <div className="pay-options">
              {["COD", "UPI", "CARD"].map((m) => (
                <label key={m} className={`pay ${form.paymentMethod === m ? "is-on" : ""}`}>
                  <input type="radio" name="pay" checked={form.paymentMethod === m} onChange={() => set("paymentMethod", m)} />
                  <span>{PAYMENT_LABEL[m]}</span>
                </label>
              ))}
            </div>
            <p className="muted small">This is a demo store: no real payment is taken for UPI or card.</p>
          </section>
        </div>
        <Summary cart={cart}>
          <ul className="mini-lines">
            {cart.items.map((i) => (
              <li key={i.productId}><span>{i.quantity} × {i.name}</span><span>{formatINR(i.lineTotal)}</span></li>
            ))}
          </ul>
          {message && <p className="form-error" role="alert">{message}</p>}
          <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={busy}>{busy ? "Placing order…" : `Place order · ${formatINR(cart.subtotal)}`}</button>
        </Summary>
      </form>
    </div>
  );
}
