import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import { useTitle } from "../hooks/useTitle";

export default function NotFound() {
  useTitle("Page not found");
  return (
    <div className="container page">
      <EmptyState icon="search" title="We can't find that page" text="The link may be broken or the page may have moved." action={<Link to="/" className="btn btn--primary">Go to the home page</Link>} />
    </div>
  );
}
