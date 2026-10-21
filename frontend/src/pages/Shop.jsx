import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CatalogApi } from "../api";
import EmptyState from "../components/EmptyState";
import Icon from "../components/Icon";
import Modal from "../components/Modal";
import Pagination from "../components/Pagination";
import { ProductGrid } from "../components/ProductCard";
import { useCategories } from "../hooks/useCategories";
import { useFetch } from "../hooks/useFetch";
import { useTitle } from "../hooks/useTitle";

const SORTS = [
  ["featured", "Featured"],
  ["newest", "Newest first"],
  ["price_asc", "Price: low to high"],
  ["price_desc", "Price: high to low"],
  ["name", "Name: A to Z"],
];
const BRACKETS = [
  ["Under ₹500", "", "500"],
  ["₹500 – ₹2,000", "500", "2000"],
  ["₹2,000 – ₹10,000", "2000", "10000"],
  ["Over ₹10,000", "10000", ""],
];

function Filters({ values, categories, onChange }) {
  const [min, setMin] = useState(values.minPrice);
  const [max, setMax] = useState(values.maxPrice);
  useEffect(() => {
    setMin(values.minPrice);
    setMax(values.maxPrice);
  }, [values.minPrice, values.maxPrice]);

  return (
    <div className="filters">
      <section>
        <h3>Category</h3>
        <ul className="filter-list">
          <li>
            <button type="button" aria-pressed={!values.category} onClick={() => onChange({ category: "" })}>All categories</button>
          </li>
          {categories.map((c) => (
            <li key={c.id}>
              <button type="button" aria-pressed={values.category === String(c.id)} onClick={() => onChange({ category: c.id })}>{c.name}</button>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h3>Price</h3>
        <div className="chips">
          {BRACKETS.map(([label, lo, hi]) => {
            const on = values.minPrice === lo && values.maxPrice === hi;
            return (
              <button key={label} type="button" className="chip" aria-pressed={on} onClick={() => onChange(on ? { minPrice: "", maxPrice: "" } : { minPrice: lo, maxPrice: hi })}>
                {label}
              </button>
            );
          })}
        </div>
        <form
          className="price-form"
          onSubmit={(e) => {
            e.preventDefault();
            onChange({ minPrice: min, maxPrice: max });
          }}
        >
          <input className="input" type="number" min="0" inputMode="numeric" placeholder="Min ₹" aria-label="Minimum price" value={min} onChange={(e) => setMin(e.target.value)} />
          <span aria-hidden="true">–</span>
          <input className="input" type="number" min="0" inputMode="numeric" placeholder="Max ₹" aria-label="Maximum price" value={max} onChange={(e) => setMax(e.target.value)} />
          <button type="submit" className="btn btn--dark btn--sm">Go</button>
        </form>
      </section>
    </div>
  );
}

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const { categories } = useCategories();
  const [drawer, setDrawer] = useState(false);

  const values = {
    q: params.get("q") || "",
    category: params.get("category") || "",
    minPrice: params.get("minPrice") || "",
    maxPrice: params.get("maxPrice") || "",
    sort: params.get("sort") || "featured",
  };
  const page = Math.max(1, parseInt(params.get("page") || "1", 10) || 1);

  const { data, loading, error, reload } = useFetch(
    () => CatalogApi.products({ ...values, sort: values.sort === "featured" ? "" : values.sort, page: page - 1, size: 12 }),
    [params.toString()]
  );

  const activeCat = categories.find((c) => String(c.id) === values.category);
  const heading = values.q ? `Results for “${values.q}”` : activeCat ? activeCat.name : "All products";
  useTitle(heading);

  function change(patch) {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(patch).forEach(([k, v]) => {
        if (v === "" || v == null) next.delete(k);
        else next.set(k, String(v));
      });
      if (!("page" in patch)) next.delete("page");
      if (next.get("sort") === "featured") next.delete("sort");
      return next;
    });
  }

  const items = data?.items || [];
  const total = data?.totalElements ?? 0;
  const hasFilters = values.q || values.category || values.minPrice || values.maxPrice;

  return (
    <div className="container page">
      <nav className="crumbs" aria-label="Breadcrumb">Home / Shop{activeCat ? ` / ${activeCat.name}` : ""}</nav>
      <h1 className="page-title">{heading}</h1>
      <div className="shop-layout">
        <aside className="shop-side" aria-label="Filters">
          <Filters values={values} categories={categories} onChange={change} />
        </aside>
        <div>
          <div className="shop-bar">
            <p role="status" aria-live="polite">{loading ? "Loading…" : `${total} ${total === 1 ? "product" : "products"}`}</p>
            <button type="button" className="btn btn--outline btn--sm shop-filter-btn" onClick={() => setDrawer(true)}>
              <Icon name="filter" size={18} /> Filters
            </button>
            <label className="shop-sort">
              <span>Sort by</span>
              <select className="select" value={values.sort} onChange={(e) => change({ sort: e.target.value })}>
                {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
          </div>
          {hasFilters && (
            <button type="button" className="text-link clear-all" onClick={() => setParams(new URLSearchParams())}>Clear all filters</button>
          )}
          {error ? (
            <EmptyState icon="alert" title="We couldn't load products" text={error.message} action={<button className="btn btn--dark" onClick={reload}>Try again</button>} />
          ) : !loading && items.length === 0 ? (
            <EmptyState icon="search" title="No products found" text="Try a different search or clear the filters." action={<button className="btn btn--dark" onClick={() => setParams(new URLSearchParams())}>Show everything</button>} />
          ) : (
            <ProductGrid products={items} loading={loading} count={12} />
          )}
          <Pagination page={page} totalPages={data?.totalPages || 1} onChange={(p) => { change({ page: p > 1 ? p : "" }); window.scrollTo({ top: 0 }); }} />
        </div>
      </div>
      {drawer && (
        <Modal title="Filters" variant="drawer" onClose={() => setDrawer(false)} footer={<button className="btn btn--primary btn--block" onClick={() => setDrawer(false)}>Show {total} products</button>}>
          <Filters values={values} categories={categories} onChange={change} />
        </Modal>
      )}
    </div>
  );
}
