import Icon from "./Icon";

export default function QtyStepper({ value, min = 1, max = 99, onChange, disabled = false, label = "Quantity" }) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  return (
    <div className="qty" role="group" aria-label={label}>
      <button type="button" className="qty-btn" onClick={dec} disabled={disabled || value <= min} aria-label="Decrease quantity">
        <Icon name="minus" size={18} strokeWidth={2.4} />
      </button>
      <output className="qty-value" aria-live="polite">
        {value}
      </output>
      <button type="button" className="qty-btn" onClick={inc} disabled={disabled || value >= max} aria-label="Increase quantity">
        <Icon name="plus" size={18} strokeWidth={2.4} />
      </button>
    </div>
  );
}
