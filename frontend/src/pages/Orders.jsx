import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { OrderApi } from "../api";
import { apiError } from "../api/client";
import EmptyState from "../components/EmptyState";
import Icon from "../components/Icon";
import SafeImage from "../components/SafeImage";
import StatusPill from "../components/StatusPill";
import { useToast } from "../context/ToastContext";
import { useFetch } from "../hooks/useFetch";
import { useTitle } from "../hooks/useTitle";
import { formatDate, formatINR, PAYMENT_LABEL, STATUS_ORDER } from "../utils/format";

export function Orders() {
  useTitle("My orders");
  const { data, loading, error, reload } = useFetch(() => OrderApi.mine(), []);
  if (error) return <div className="container page"><EmptyState icon="alert" title="Couldn't load your orders" text={error.message} action={<button className="btn btn--dark" onClick={reload}>Try again</button>} /></div>;
  if (!loading && data?.length === 0) return <div className="container page"><EmptyState icon="package" title="No orders yet" text="When you place an order it will show up here." action={<Link to="/shop" className="btn btn--primary">Start shopping</Link>} /></div>;
  return (
    <div className="container page">
      <h1 className="page-title">My orders</h1>
      {loading ? <div className="skeleton sk-line" /> : (
        <ul className="order-list">
          {data.map((o) => (
            <li key={o.id} className="panel order-card">
              <div className="order-head">
                <div><strong>Order #{o.id}</strong><span className="muted"> · {formatDate(o.createdAt)}</span></div>
                <StatusPill status={o.status} />
              </div>
              <div className="order-thumbs">
                {o.items.slice(0, 4).map((i, k) => <SafeImage key={k} src={i.imageUrl} alt={i.name} width={64} height={64} request={160} />)}
                {o.items.length > 4 && <span className="more">+{o.items.length - 4}</span>}
              </div>
              <div className="order-head">
                <strong>{formatINR(o.total)}</strong>
                <Link to={`/orders/${o.id}`} className="text-link">View details →</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function OrderDetail() {
  const { id } = useParams();
  const { state } = useLocation();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const { data: o, loading, error, reload } = useFetch(() => OrderApi.get(id), [id]);
  useTitle(`Order #${id}`);

  async function cancel() {
    if (!window.confirm("Cancel this order?")) return;
    setBusy(true);
    try {
      await OrderApi.cancel(id);
      toast.success("Order cancelled");
      reload();
    } catch (err) {
      toast.error(apiError(err).message);
    }
    setBusy(false);
  }

  if (loading) return <div className="container page"><div className="skeleton sk-line" /></div>;
  if (error || !o) return <div className="container page"><EmptyState icon="alert" title="Order not found" text={error?.message} action={<Link to="/orders" className="btn btn--dark">My orders</Link>} /></div>;

  const step = STATUS_ORDER.indexOf(o.status);
  return (
    <div className="container page">
      {state?.placed && (
        <div className="success-banner" role="status">
          <span className="success-ico"><Icon name="check" size={28} strokeWidth={2.6} /></span>
          <div><h2>Thank you, your order is placed!</h2><p>We'll start packing it right away.</p></div>
        </div>
      )}
      <div className="order-head">
        <h1 className="page-title">Order #{o.id}</h1>
        <StatusPill status={o.status} />
      </div>
      {o.status !== "CANCELLED" && (
        <ol className="tracker" aria-label="Order progress">
          {STATUS_ORDER.map((s, i) => (
            <li key={s} className={i <= step ? "is-done" : ""}><span className="dot" />{s.charAt(0) + s.slice(1).toLowerCase()}</li>
          ))}
        </ol>
      )}
      <div className="two-col">
        <section className="panel">
          <h2>Items</h2>
          <ul className="cart-list">
            {o.items.map((i, k) => (
              <li key={k} className="cart-line">
                <div className="cart-photo"><SafeImage src={i.imageUrl} alt="" width={160} height={160} request={240} /></div>
                <div className="cart-main">
                  {i.productId ? <Link to={`/product/${i.productId}`} className="cart-name">{i.name}</Link> : <span className="cart-name">{i.name}</span>}
                  <p className="muted">{i.quantity} × {formatINR(i.unitPrice)}</p>
                </div>
                <p className="cart-total">{formatINR(i.lineTotal)}</p>
              </li>
            ))}
          </ul>
        </section>
        <aside className="summary">
          <h2>Details</h2>
          <dl>
            <div><dt>Placed on</dt><dd>{formatDate(o.createdAt)}</dd></div>
            <div><dt>Payment</dt><dd>{PAYMENT_LABEL[o.paymentMethod] || o.paymentMethod}</dd></div>
            <div className="summary-total"><dt>Total</dt><dd>{formatINR(o.total)}</dd></div>
          </dl>
          <h3 className="small-h">Delivering to</h3>
          <address className="addr">{o.fullName}<br />{o.address}<br />{o.city}, {o.state} {o.pincode}<br />Phone: {o.phone}</address>
          {(o.status === "PLACED" || o.status === "PROCESSING") && (
            <button type="button" className="btn btn--outline btn--block" disabled={busy} onClick={cancel}>Cancel order</button>
          )}
        </aside>
      </div>
    </div>
  );
}
