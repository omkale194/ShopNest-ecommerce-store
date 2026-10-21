import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { STORE_NAME } from "../config";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useCategories } from "../hooks/useCategories";
import Icon from "./Icon";

export function Brand({ light = false }) {
  return (
    <Link to="/" className={`brand ${light ? "brand--light" : ""}`} aria-label={`${STORE_NAME} home`}>
      <span className="brand-mark" aria-hidden="true">S</span>
      <span className="brand-name">{STORE_NAME}</span>
    </Link>
  );
}

function AccountMenu() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (e.type === "keydown" ? e.key === "Escape" : !ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  if (!user) {
    return (
      <Link to="/login" className="hlink">
        <Icon name="user" size={22} />
        <span className="hlink-text">Log in</span>
      </Link>
    );
  }
  return (
    <div className="menu" ref={ref}>
      <button type="button" className="hlink" aria-expanded={open} aria-haspopup="true" onClick={() => setOpen(!open)}>
        <span className="avatar" aria-hidden="true">{user.name.charAt(0).toUpperCase()}</span>
        <span className="hlink-text">{user.name.split(" ")[0]}</span>
        <Icon name="chevron-down" size={16} />
      </button>
      {open && (
        <div className="menu-pop" role="menu">
          <p className="menu-who">{user.email}</p>
          <Link role="menuitem" to="/orders" onClick={() => setOpen(false)}>
            <Icon name="package" size={18} /> My orders
          </Link>
          {isAdmin && (
            <Link role="menuitem" to="/admin" onClick={() => setOpen(false)}>
              <Icon name="dashboard" size={18} /> Admin panel
            </Link>
          )}
          <button
            role="menuitem"
            type="button"
            onClick={() => {
              setOpen(false);
              logout();
              navigate("/");
            }}
          >
            <Icon name="logout" size={18} /> Log out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const { cart, bump } = useCart();
  const { categories } = useCategories();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");
  const activeCat = location.pathname === "/shop" ? params.get("category") : null;

  useEffect(() => {
    if (location.pathname !== "/shop") setQ("");
  }, [location.pathname]);

  function submit(e) {
    e.preventDefault();
    const text = q.trim();
    navigate(text ? `/shop?q=${encodeURIComponent(text)}` : "/shop");
  }

  return (
    <header className="header">
      <div className="topbar">
        <p>Free delivery on every order · Cash on delivery available · Easy 7-day returns</p>
      </div>
      <div className="container header-main">
        <Brand />
        <form className="hsearch" role="search" onSubmit={submit}>
          <label htmlFor="hq" className="visually-hidden">Search products</label>
          <input id="hq" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search for products, brands and more" />
          <button type="submit" aria-label="Search">
            <Icon name="search" size={20} />
          </button>
        </form>
        <nav className="hactions" aria-label="Account">
          <AccountMenu />
          <Link to="/cart" className="hlink" aria-label={`Cart, ${cart.itemCount} items`}>
            <span key={bump} className={`cart-ico ${bump ? "is-bump" : ""}`}>
              <Icon name="cart" size={24} />
              {cart.itemCount > 0 && <span className="cart-count">{cart.itemCount}</span>}
            </span>
            <span className="hlink-text">Cart</span>
          </Link>
        </nav>
      </div>
      <nav className="catbar" aria-label="Categories">
        <ul className="container">
          <li>
            <NavLink to="/shop" end className={() => `cat-link ${location.pathname === "/shop" && !activeCat ? "is-active" : ""}`}>
              All
            </NavLink>
          </li>
          {categories.map((c) => (
            <li key={c.id}>
              <Link to={`/shop?category=${c.id}`} className={`cat-link ${activeCat === String(c.id) ? "is-active" : ""}`}>
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
