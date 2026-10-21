const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

/** 1499 -> ₹1,499, 1499.5 -> ₹1,499.50 */
export function formatINR(value) {
  const n = Number(value) || 0;
  const whole = Math.abs(n - Math.round(n)) < 0.005;
  const text = whole
    ? inr.format(Math.round(n))
    : n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `₹${text}`;
}

/** Shown in the viewer's own time zone. */
export function formatDate(iso, withTime = true) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-IN", withTime ? { dateStyle: "medium", timeStyle: "short" } : { dateStyle: "medium" });
}

export const STATUS_LABEL = {
  PLACED: "Placed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const STATUS_ORDER = ["PLACED", "PROCESSING", "SHIPPED", "DELIVERED"];

export const PAYMENT_LABEL = {
  COD: "Cash on delivery",
  UPI: "UPI (demo payment)",
  CARD: "Card (demo payment)",
};

/** Percentage off when an MRP higher than the price is set, else 0. */
export function discountOf(product) {
  const mrp = Number(product?.mrp) || 0;
  const price = Number(product?.price) || 0;
  return mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
}
