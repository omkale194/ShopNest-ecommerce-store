import { Link } from "react-router-dom";
import { STORE_NAME } from "../config";
import { useAuth } from "../context/AuthContext";
import { useCategories } from "../hooks/useCategories";
import { Brand } from "./Header";

export default function Footer() {
  const { user } = useAuth();
  const { categories } = useCategories();
  return (
    <footer className="footer on-dark">
      <div className="container footer-grid">
        <div>
          <Brand light />
          <p className="footer-about">Everyday essentials, gadgets and gifts delivered to your door. Cash on delivery across India.</p>
        </div>
        <nav aria-label="Shop">
          <h4>Shop</h4>
          <ul>
            <li><Link to="/shop">All products</Link></li>
            {categories.map((c) => (
              <li key={c.id}><Link to={`/shop?category=${c.id}`}>{c.name}</Link></li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Account">
          <h4>Your account</h4>
          <ul>
            {user ? (
              <>
                <li><Link to="/orders">My orders</Link></li>
                <li><Link to="/cart">Cart</Link></li>
              </>
            ) : (
              <>
                <li><Link to="/login">Log in</Link></li>
                <li><Link to="/register">Create an account</Link></li>
              </>
            )}
          </ul>
        </nav>
      </div>
      <div className="container footer-base">
<p>© {new Date().getFullYear()} {STORE_NAME}. All rights reserved.</p>    <p>Product photos from <a href="https://unsplash.com" target="_blank" rel="noreferrer">Unsplash</a>.</p>
      </div>
    </footer>
  );
}
