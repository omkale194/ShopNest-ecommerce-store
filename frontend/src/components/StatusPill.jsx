import { STATUS_LABEL } from "../utils/format";

export default function StatusPill({ status }) {
  return <span className={`pill pill--${String(status).toLowerCase()}`}>{STATUS_LABEL[status] || status}</span>;
}
