import { Link } from "react-router-dom";
import { CatalogApi } from "../api";
import EmptyState from "../components/EmptyState";
import Icon from "../components/Icon";
import { ProductGrid } from "../components/ProductCard";
import SafeImage from "../components/SafeImage";
import { useCategories } from "../hooks/useCategories";
import { useFetch } from "../hooks/useFetch";
import { useTitle } from "../hooks/useTitle";
import { formatINR } from "../utils/format";

const PERKS = [
  ["truck", "Free delivery", "On every order, all over India"],
  ["return", "7-day returns", "Changed your mind? No questions asked"],
  ["shield", "Secure checkout", "Your details stay private"],
  ["cash", "Cash on delivery", "Pay when your order arrives"],
];

export default function Home() {
  useTitle("");
  const { categories } = useCategories();
  const featured = useFetch(() => CatalogApi.featured(), []);
  const fresh = useFetch(() => CatalogApi.products({ sort: "newest", size: 8 }), []);
  const deals = useFetch(() => CatalogApi.products({ sort: "price_asc", maxPrice: 1000, size: 4 }), []);

  const hero = (featured.data || []).slice(0, 3);
  // first featured product's photo stands in as each category's picture
  const catPhoto = {};
  (featured.data || []).forEach((p) => {
    if (!catPhoto[p.categoryId]) catPhoto[p.categoryId] = p.imageUrl;
  });

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">New season · Free delivery</span>
            <h1>Everything you love, delivered fast.</h1>
            <p>Gadgets, fashion, home essentials and more. Hand-picked products, honest prices and cash on delivery.</p>
            <div className="hero-actions">
              <Link to="/shop" className="btn btn--primary btn--lg">Shop now</Link>
              <Link to="/shop?sort=price_asc&maxPrice=1000" className="btn btn--ghost-light btn--lg">Deals under ₹1,000</Link>
            </div>
          </div>
          <div className="hero-visual" aria-hidden={hero.length === 0}>
            {hero.map((p, i) => (
              <Link key={p.id} to={`/product/${p.id}`} className={`hero-tile hero-tile--${i + 1}`} aria-label={p.name}>
                <SafeImage src={p.imageUrl} alt="" width={600} height={600} request={600} eager />
                <span className="hero-chip">{formatINR(p.price)}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="perks" aria-label="Why shop with us">
        <ul className="container perks-list">
          {PERKS.map(([icon, title, text]) => (
            <li key={title}>
              <span className="perk-ico"><Icon name={icon} size={24} /></span>
              <div>
                <strong>{title}</strong>
                <span>{text}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head"><h2>Shop by category</h2></div>
          <ul className="cat-tiles">
            {categories.map((c) => (
              <li key={c.id}>
                <Link to={`/shop?category=${c.id}`} className="cat-tile">
                  {catPhoto[c.id] ? <SafeImage src={catPhoto[c.id]} alt="" width={400} height={400} request={400} /> : <span className="cat-fill" />}
                  <span className="cat-name">{c.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section--white">
        <div className="container">
          <div className="section-head">
            <h2>Trending now</h2>
            <Link to="/shop" className="text-link">View all →</Link>
          </div>
          {featured.error ? (
            <EmptyState icon="alert" title="We couldn't load products" text={featured.error.message} action={<button className="btn btn--dark" onClick={featured.reload}>Try again</button>} />
          ) : (
            <ProductGrid products={featured.data || []} loading={featured.loading} count={8} />
          )}
        </div>
      </section>

      <section className="section">
        <div className="container banners">
          <Link to="/shop?sort=newest" className="banner banner--a">
            <span className="eyebrow">Just in</span>
            <strong>New arrivals are here</strong>
            <span className="btn btn--primary btn--sm">Explore</span>
          </Link>
          <Link to="/shop?maxPrice=1000&sort=price_asc" className="banner banner--b">
            <span className="eyebrow">Budget picks</span>
            <strong>Great finds under ₹1,000</strong>
            <span className="btn btn--dark btn--sm">Shop deals</span>
          </Link>
        </div>
      </section>

      <section className="section section--tight">
        <div className="container">
          <div className="section-head">
            <h2>Fresh on the shelves</h2>
            <Link to="/shop?sort=newest" className="text-link">See more →</Link>
          </div>
          <ProductGrid products={fresh.data?.items || []} loading={fresh.loading} count={8} />
        </div>
      </section>

      {(deals.data?.items || []).length > 0 && (
        <section className="section section--tight">
          <div className="container">
            <div className="section-head"><h2>Pocket-friendly picks</h2></div>
            <ProductGrid products={deals.data.items} loading={false} />
          </div>
        </section>
      )}
    </>
  );
}
