import { discountOf, formatINR } from "../utils/format";

export default function Price({ product, size = "md" }) {
  const off = discountOf(product);
  return (
    <p className={`price price--${size}`}>
      <span className="price-now">{formatINR(product.price)}</span>
      {off > 0 && (
        <>
          <s className="price-old">{formatINR(product.mrp)}</s>
          <span className="price-off">{off}% off</span>
        </>
      )}
    </p>
  );
}
