import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CatalogApi } from "../api";
import EmptyState from "../components/EmptyState";
import Icon from "../components/Icon";
import Price from "../components/Price";
import { ProductGrid } from "../components/ProductCard";
import QtyStepper from "../components/QtyStepper";
import SafeImage from "../components/SafeImage";
import { useCart } from "../context/CartContext";
import { useFetch } from "../hooks/useFetch";
import { useTitle } from "../hooks/useTitle";
import { discountOf, formatINR } from "../utils/format";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const { data: p, loading, error } = useFetch(() => CatalogApi.product(id), [id]);
  const similar = useFetch(() => (p ? CatalogApi.products({ category: p.categoryId, size: 5 }) : Promise.resolve(null)), [p?.id]);
  useTitle(p?.name || "Product");

  if (loading) {
    return (
      <div className="container page pd">
        <div className="skeleton sk-photo" />
        <div className="pd-info"><div className="skeleton sk-line" /><div className="skeleton sk-line sk-line--s" /></div>
      </div>
    );
  }
  if (error || !p) {
    return (
      <div className="container page">
        <EmptyState icon="alert" title={error?.status === 404 ? "This product isn't available" : "We couldn't load this product"} text={error?.message} action={<Link to="/shop" className="btn btn--dark">Back to shop</Link>} />
      </div>
    );
  }

  const out = p.stock <= 0;
  const max = Math.max(1, Math.min(p.stock, 10));
  const related = (similar.data?.items || []).filter((x) => x.id !== p.id).slice(0, 4);

  async function addToCart(thenCheckout) {
    setBusy(true);
    const ok = await add(p.id, qty);
    setBusy(false);
    if (ok && thenCheckout) navigate("/cart");
  }

  return (
    <div className="container page">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link> / <Link to={`/shop?category=${p.categoryId}`}>{p.categoryName}</Link> / {p.name}
      </nav>
      <div className="pd">
        <div className="pd-photo">
          <SafeImage src={p.imageUrl} alt={p.name} width={900} height={900} request={1000} eager />
          {discountOf(p) > 0 && !out && <span className="badge badge--sale">-{discountOf(p)}%</span>}
        </div>
        <div className="pd-info">
          <p className="pcard-cat">{p.categoryName}</p>
          <h1>{p.name}</h1>
          {p.brand && <p className="pcard-brand">by {p.brand}</p>}
          <Price product={p} size="lg" />
          {discountOf(p) > 0 && <p className="save-line">You save {formatINR(Number(p.mrp) - Number(p.price))}</p>}
          <p className="pd-desc">{p.description || "No description yet."}</p>
          <p className={`stock ${out ? "stock--out" : p.stock <= 5 ? "stock--low" : "stock--ok"}`}>
            {out ? "Out of stock" : p.stock <= 5 ? `Only ${p.stock} left, order soon` : "In stock"}
          </p>
          {!out && (
            <div className="pd-buy">
              <QtyStepper value={qty} max={max} onChange={setQty} />
              <button type="button" className="btn btn--primary btn--lg" disabled={busy} onClick={() => addToCart(false)}>
                <Icon name="cart" size={20} /> Add to cart
              </button>
              <button type="button" className="btn btn--dark btn--lg" disabled={busy} onClick={() => addToCart(true)}>Buy now</button>
            </div>
          )}
          <ul className="pd-perks">
            <li><Icon name="truck" size={20} /> Free delivery in 3–5 days</li>
            <li><Icon name="return" size={20} /> 7-day easy returns</li>
            <li><Icon name="cash" size={20} /> Cash on delivery available</li>
          </ul>
        </div>
      </div>
      {related.length > 0 && (
        <section className="section section--tight">
          <div className="section-head"><h2>You may also like</h2></div>
          <ProductGrid products={related} loading={false} />
        </section>
      )}
    </div>
  );
}
