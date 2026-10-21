import Icon from "./Icon";

/** Centered message with an optional action, used for empty lists and failed loads. */
export default function EmptyState({ icon = "package", title, text, action }) {
  return (
    <div className="empty">
      <span className="empty-icon">
        <Icon name={icon} size={30} />
      </span>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
      {action && <div className="empty-action">{action}</div>}
    </div>
  );
}
