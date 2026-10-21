import { Link, useNavigate } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import Icon from "../components/Icon";
import QtyStepper from "../components/QtyStepper";
import SafeImage from "../components/SafeImage";
import { useCart } from "../context/CartContext";
import { useTitle } from "../hooks/useTitle";
import { formatINR } from "../utils/format";

export function Summary({ cart, children }) {
  return (
    <aside className="summary" aria-label="Order summary">
      <h2>Order summary</h2>
      <dl>
        <div><dt>Items ({cart.itemCount})</dt><dd>{formatINR(cart.subtotal)}</dd></div>
        <div><dt>Delivery</dt><dd className="free">Free</dd></div>
        <div className="summary-total"><dt>Total</dt><dd>{formatINR(cart.subtotal)}</dd></div>
      </dl>
      {children}
    </aside>
  );
}

export default function Cart() {
  useTitle("Your cart");
  const { cart, loading, update, remove, clear } = useCart();
  const navigate = useNavigate();
  const blocked = cart.items.some((i) => !i.available || i.quantity > i.stock);

  if (!loading && cart.items.length === 0) {
    return (
      <div className="container page">
        <EmptyState icon="cart" title="Your cart is empty" text="Add a few things you like and they will show up here." action={<Link to="/shop" className="btn btn--primary">Start shopping</Link>} />
      </div>
    );
  }

  return (
    <div className="container page">
      <h1 className="page-title">Your cart</h1>
      <div className="two-col">
        <ul className="cart-list">
          {cart.items.map((i) => (
            <li key={i.productId} className="cart-line">
              <Link to={`/product/${i.productId}`} className="cart-photo"><SafeImage src={i.imageUrl} alt="" width={160} height={160} request={240} /></Link>
              <div className="cart-main">
                <Link to={`/product/${i.productId}`} className="cart-name">{i.name}</Link>
                <p className="muted">{formatINR(i.price)} each</p>
                {!i.available && <p className="field-error">No longer available. Please remove it.</p>}
                {i.available && i.quantity > i.stock && <p className="field-error">Only {i.stock} left. Reduce the quantity.</p>}
                <div className="cart-actions">
                  <QtyStepper value={i.quantity} max={Math.max(1, Math.min(i.stock, 99))} onChange={(q) => update(i.productId, q)} disabled={!i.available} />
                  <button type="button" className="link-btn" onClick={() => remove(i.productId)}><Icon name="trash" size={16} /> Remove</button>
                </div>
              </div>
              <p className="cart-total">{formatINR(i.lineTotal)}</p>
            </li>
          ))}
          <li className="cart-clear"><button type="button" className="link-btn" onClick={clear}>Empty cart</button></li>
        </ul>
        <Summary cart={cart}>
          <button type="button" className="btn btn--primary btn--lg btn--block" disabled={blocked} onClick={() => navigate("/checkout")}>Proceed to checkout</button>
          <Link to="/shop" className="text-link center">Continue shopping</Link>
        </Summary>
      </div>
    </div>
  );
}
