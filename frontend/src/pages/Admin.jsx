import { useState } from "react";
import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import { AdminApi } from "../api";
import { apiError } from "../api/client";
import Icon from "../components/Icon";
import Modal from "../components/Modal";
import Pagination from "../components/Pagination";
import SafeImage from "../components/SafeImage";
import StatusPill from "../components/StatusPill";
import { useToast } from "../context/ToastContext";
import { invalidateCategories, useCategories } from "../hooks/useCategories";
import { useFetch } from "../hooks/useFetch";
import { useTitle } from "../hooks/useTitle";
import { formatDate, formatINR, STATUS_LABEL } from "../utils/format";

function Dashboard() {
  const { data, loading, error } = useFetch(() => AdminApi.stats(), []);
  const cards = data && [
    ["Revenue", formatINR(data.revenue)],
    ["Orders", data.orders],
    ["Products", data.products],
    ["Customers", data.customers],
  ];
  return (
    <>
      <h1>Dashboard</h1>
      {error && <p className="form-error">{error.message}</p>}
      <div className="stat-grid">
        {loading ? [0, 1, 2, 3].map((i) => <div key={i} className="skeleton sk-stat" />) : cards?.map(([l, v]) => (
          <div key={l} className="stat"><span>{l}</span><strong>{v}</strong></div>
        ))}
      </div>
      <p className="muted small">Revenue counts every order that is not cancelled.</p>
    </>
  );
}

const EMPTY = { name: "", brand: "", description: "", price: "", mrp: "", stock: "0", imageUrl: "", featured: false, active: true, categoryId: "" };

function ProductForm({ product, categories, onClose, onSaved }) {
  const toast = useToast();
  const [f, setF] = useState(product ? { ...EMPTY, ...product, mrp: product.mrp ?? "", brand: product.brand ?? "", description: product.description ?? "", imageUrl: product.imageUrl ?? "" } : { ...EMPTY, categoryId: categories[0]?.id ?? "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    setMessage("");
    const body = {
      name: f.name, brand: f.brand, description: f.description, price: f.price === "" ? null : Number(f.price),
      mrp: f.mrp === "" ? null : Number(f.mrp), stock: Number(f.stock) || 0, imageUrl: f.imageUrl,
      featured: !!f.featured, active: !!f.active, categoryId: f.categoryId === "" ? null : Number(f.categoryId),
    };
    try {
      if (product) await AdminApi.updateProduct(product.id, body);
      else await AdminApi.createProduct(body);
      toast.success(product ? "Product updated" : "Product added");
      onSaved();
    } catch (err) {
      const info = apiError(err);
      setErrors(info.fieldErrors);
      setMessage(info.message);
      setBusy(false);
    }
  }

  const input = (label, key, props = {}) => (
    <div className="field">
      <label className="field-label" htmlFor={`pf-${key}`}>{label}</label>
      <input id={`pf-${key}`} className="input" value={f[key]} onChange={(e) => set(key, e.target.value)} aria-invalid={errors[key] ? "true" : undefined} {...props} />
      {errors[key] && <p className="field-error">{errors[key]}</p>}
    </div>
  );

  return (
    <Modal title={product ? "Edit product" : "Add product"} onClose={onClose}>
      <form onSubmit={save} noValidate className="form-grid">
        <div className="span-2">{input("Name", "name", { "data-autofocus": true })}</div>
        {input("Brand", "brand")}
        <div className="field">
          <label className="field-label" htmlFor="pf-cat">Category</label>
          <select id="pf-cat" className="select" value={f.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
            <option value="">Choose…</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {errors.categoryId && <p className="field-error">{errors.categoryId}</p>}
        </div>
        {input("Selling price (₹)", "price", { type: "number", min: "0", step: "0.01" })}
        {input("MRP (₹, optional)", "mrp", { type: "number", min: "0", step: "0.01" })}
        {input("Stock", "stock", { type: "number", min: "0" })}
        <div className="field">
          <span className="field-label">Options</span>
          <label className="check"><input type="checkbox" checked={f.featured} onChange={(e) => set("featured", e.target.checked)} /> Featured on home page</label>
          <label className="check"><input type="checkbox" checked={f.active} onChange={(e) => set("active", e.target.checked)} /> Visible in shop</label>
        </div>
        <div className="span-2">
          {input("Image link (https://…)", "imageUrl")}
          {f.imageUrl && <div className="img-preview"><SafeImage src={f.imageUrl} alt="Preview" width={120} height={120} request={240} /></div>}
        </div>
        <div className="span-2 field">
          <label className="field-label" htmlFor="pf-desc">Description</label>
          <textarea id="pf-desc" className="textarea" rows={4} value={f.description} onChange={(e) => set("description", e.target.value)} />
        </div>
        {message && <p className="form-error span-2" role="alert">{message}</p>}
        <div className="span-2 modal-actions">
          <button type="button" className="btn btn--outline" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" disabled={busy}>{busy ? "Saving…" : "Save product"}</button>
        </div>
      </form>
    </Modal>
  );
}

function Products() {
  const toast = useToast();
  const { categories } = useCategories();
  const [q, setQ] = useState("");
  const [term, setTerm] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const { data, loading, error, reload } = useFetch(() => AdminApi.products({ q: term, page: page - 1, size: 10 }), [term, page]);

  async function hide(p) {
    if (!window.confirm(`Hide “${p.name}” from the shop? Past orders are kept.`)) return;
    try {
      await AdminApi.hideProduct(p.id);
      toast.success("Product hidden");
      reload();
    } catch (err) {
      toast.error(apiError(err).message);
    }
  }

  return (
    <>
      <div className="admin-bar">
        <h1>Products</h1>
        <button className="btn btn--primary" onClick={() => setEditing({})}><Icon name="plus" size={18} /> Add product</button>
      </div>
      <form className="admin-search" onSubmit={(e) => { e.preventDefault(); setPage(1); setTerm(q.trim()); }}>
        <input className="input" placeholder="Search products" aria-label="Search products" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn btn--dark">Search</button>
      </form>
      {error && <p className="form-error">{error.message}</p>}
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th><span className="visually-hidden">Actions</span></th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan="6">Loading…</td></tr>}
            {(data?.items || []).map((p) => (
              <tr key={p.id}>
                <td><div className="cell-prod"><SafeImage src={p.imageUrl} alt="" width={44} height={44} request={120} /><span>{p.name}</span></div></td>
                <td>{p.categoryName}</td>
                <td>{formatINR(p.price)}</td>
                <td className={p.stock <= 5 ? "low" : ""}>{p.stock}</td>
                <td><span className={`pill ${p.active ? "pill--delivered" : "pill--cancelled"}`}>{p.active ? "Visible" : "Hidden"}</span></td>
                <td className="row-actions">
                  <button className="icon-btn" aria-label={`Edit ${p.name}`} onClick={() => setEditing(p)}><Icon name="edit" size={18} /></button>
                  {p.active && <button className="icon-btn" aria-label={`Hide ${p.name}`} onClick={() => hide(p)}><Icon name="trash" size={18} /></button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={data?.totalPages || 1} onChange={setPage} />
      {editing && <ProductForm product={editing.id ? editing : null} categories={categories} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />}
    </>
  );
}

function Categories() {
  const toast = useToast();
  const { categories } = useCategories();
  const [name, setName] = useState("");
  const [edit, setEdit] = useState(null);

  async function run(fn, ok) {
    try {
      await fn();
      toast.success(ok);
      invalidateCategories();
      return true;
    } catch (err) {
      toast.error(apiError(err).message);
      return false;
    }
  }

  return (
    <>
      <h1>Categories</h1>
      <form className="admin-search" onSubmit={async (e) => { e.preventDefault(); if (name.trim() && (await run(() => AdminApi.createCategory({ name }), "Category added"))) setName(""); }}>
        <input className="input" placeholder="New category name" aria-label="New category name" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="btn btn--primary">Add</button>
      </form>
      <ul className="panel plain-list">
        {categories.map((c) => (
          <li key={c.id}>
            {edit?.id === c.id ? (
              <form className="admin-search" onSubmit={async (e) => { e.preventDefault(); if (await run(() => AdminApi.updateCategory(c.id, { name: edit.name }), "Category renamed")) setEdit(null); }}>
                <input className="input" aria-label="Category name" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} data-autofocus />
                <button className="btn btn--dark btn--sm">Save</button>
                <button type="button" className="btn btn--outline btn--sm" onClick={() => setEdit(null)}>Cancel</button>
              </form>
            ) : (
              <>
                <span>{c.name}</span>
                <span className="row-actions">
                  <button className="icon-btn" aria-label={`Rename ${c.name}`} onClick={() => setEdit({ id: c.id, name: c.name })}><Icon name="edit" size={18} /></button>
                  <button className="icon-btn" aria-label={`Delete ${c.name}`} onClick={() => window.confirm(`Delete “${c.name}”?`) && run(() => AdminApi.deleteCategory(c.id), "Category deleted")}><Icon name="trash" size={18} /></button>
                </span>
              </>
            )}
          </li>
        ))}
      </ul>
      <p className="muted small">A category that still has products cannot be deleted.</p>
    </>
  );
}

const STATUSES = ["PLACED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

function Orders() {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(() => AdminApi.orders(), []);
  const [open, setOpen] = useState(null);

  async function change(o, status) {
    try {
      await AdminApi.setStatus(o.id, status);
      toast.success(`Order #${o.id} is now ${STATUS_LABEL[status]}`);
      reload();
    } catch (err) {
      toast.error(apiError(err).message);
    }
  }

  return (
    <>
      <h1>Orders</h1>
      {error && <p className="form-error">{error.message}</p>}
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th><th>Update</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan="6">Loading…</td></tr>}
            {(data || []).map((o) => (
              <tr key={o.id}>
                <td><button className="link-btn" onClick={() => setOpen(o)}>#{o.id}</button></td>
                <td>{o.customerName}<br /><span className="muted small">{o.customerEmail}</span></td>
                <td>{formatDate(o.createdAt)}</td>
                <td>{formatINR(o.total)}</td>
                <td><StatusPill status={o.status} /></td>
                <td>
                  <select className="select select--sm" aria-label={`Status of order ${o.id}`} value={o.status} disabled={o.status === "CANCELLED"} onChange={(e) => change(o, e.target.value)}>
                    {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {open && (
        <Modal title={`Order #${open.id}`} onClose={() => setOpen(null)}>
          <ul className="mini-lines">{open.items.map((i, k) => <li key={k}><span>{i.quantity} × {i.name}</span><span>{formatINR(i.lineTotal)}</span></li>)}</ul>
          <p><strong>Total {formatINR(open.total)}</strong> · {open.paymentMethod}</p>
          <address className="addr">{open.fullName}<br />{open.address}<br />{open.city}, {open.state} {open.pincode}<br />Phone: {open.phone}</address>
        </Modal>
      )}
    </>
  );
}

export default function Admin() {
  useTitle("Admin");
  const tabs = [["", "Dashboard", "dashboard"], ["products", "Products", "tag"], ["categories", "Categories", "filter"], ["orders", "Orders", "package"]];
  return (
    <div className="container page admin">
      <nav className="admin-nav" aria-label="Admin">
        {tabs.map(([to, label, icon]) => (
          <NavLink key={to} to={`/admin/${to}`} end={to === ""} className={({ isActive }) => (isActive ? "is-active" : "")}>
            <Icon name={icon} size={18} /> {label}
          </NavLink>
        ))}
      </nav>
      <section className="admin-main">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="categories" element={<Categories />} />
          <Route path="orders" element={<Orders />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </section>
    </div>
  );
}
