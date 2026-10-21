import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import EmptyState from "./EmptyState";

/** Sends logged-out visitors to /login and shows a clear message to customers who open admin pages. */
export default function RequireAuth({ role, children }) {
  const { user, ready } = useAuth();
  const location = useLocation();

  if (!ready) {
    return (
      <div className="container page">
        <p className="muted" role="status">
          Checking your session…
        </p>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }
  if (role && user.role !== role) {
    return (
      <div className="container page">
        <EmptyState
          icon="shield"
          title="You don't have access to this page"
          text="This area is for store admins. Log in with an admin account to continue."
          action={
            <Link to="/" className="btn btn--dark">
              Back to the store
            </Link>
          }
        />
      </div>
    );
  }
  return children ?? <Outlet />;
}
