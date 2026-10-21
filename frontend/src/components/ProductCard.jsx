import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { discountOf } from "../utils/format";
import Icon from "./Icon";
import Price from "./Price";
import SafeImage from "./SafeImage";

export default function ProductCard({ product }) {
  const { add } = useCart();
  const [busy, setBusy] = useState(false);
  const out = product.stock <= 0;
  const off = discountOf(product);
  const link = `/product/${product.id}`;

  async function quickAdd() {
    setBusy(true);
    await add(product.id, 1);
    setBusy(false);
  }

  return (
    <article className="pcard">
      <Link to={link} className="pcard-media" tabIndex={-1} aria-hidden="true">
        <SafeImage src={product.imageUrl} alt="" width={640} height={640} request={640} />
        {off > 0 && !out && <span className="badge badge--sale">-{off}%</span>}
        {out && <span className="badge badge--out">Sold out</span>}
      </Link>
      <div className="pcard-body">
        <p className="pcard-cat">{product.categoryName}</p>
        <h3 className="pcard-name">
          <Link to={link}>{product.name}</Link>
        </h3>
        {product.brand && <p className="pcard-brand">by {product.brand}</p>}
        <div className="pcard-foot">
          <Price product={product} />
          <button type="button" className="pcard-add" onClick={quickAdd} disabled={out || busy} aria-label={`Add ${product.name} to cart`}>
            <Icon name="cart" size={18} />
            <span>Add</span>
          </button>
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products, loading, count = 8 }) {
  if (loading) {
    return (
      <ul className="pgrid" aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (
          <li key={i}>
            <div className="skeleton sk-card" />
          </li>
        ))}
      </ul>
    );
  }
  return (
    <ul className="pgrid">
      {products.map((p) => (
        <li key={p.id}>
          <ProductCard product={p} />
        </li>
      ))}
    </ul>
  );
}
