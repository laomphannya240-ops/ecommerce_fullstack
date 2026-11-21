import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { toast } from 'sonner';
import FieldError from '../../components/forms/FieldError';
import { clearFieldError, getErrorMessage, getFieldErrors } from '../../utils/validation';

const empty = { name: '', sku: '', category_id: '', brand_id: '', price: '', sale_price: '', stock_quantity: 0, short_description: '', description: '', thumbnail_url: '', is_active: true, is_featured: false };

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    try {
      const [p, c, b] = await Promise.all([api.get('/admin/products', { params: { per_page: 50 } }), api.get('/admin/categories'), api.get('/admin/brands')]);
      setProducts(p.data.data?.data || p.data.data || []);
      setCategories(c.data.data || []);
      setBrands(b.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const updateField = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => clearFieldError(previous, field));
  };

  const openCreate = () => { setEditing(null); setForm(empty); setErrors({}); setShowForm(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({ name: p.name, sku: p.sku || '', category_id: p.category_id || '', brand_id: p.brand_id || '', price: p.price, sale_price: p.sale_price ?? '', stock_quantity: p.stock_quantity, short_description: p.short_description || '', description: p.description || '', thumbnail_url: p.thumbnail_url || p.thumbnail || '', is_active: !!p.is_active, is_featured: !!p.is_featured });
    setErrors({});
    setShowForm(true);
  };

  const save = async (e) => {
    e.preventDefault();
    const payload = { ...form, category_id: Number(form.category_id), brand_id: form.brand_id ? Number(form.brand_id) : null, price: Number(form.price), sale_price: form.sale_price === '' ? null : Number(form.sale_price), stock_quantity: Number(form.stock_quantity) };
    setErrors({});

    try {
      if (editing) await api.put(`/admin/products/${editing.slug}`, payload);
      else await api.post('/admin/products', payload);
      toast.success(editing ? 'Product updated' : 'Product created');
      setShowForm(false);
      load();
    } catch (err) {
      setErrors(getFieldErrors(err));
      toast.error(getErrorMessage(err, 'Save failed'));
    }
  };

  const remove = async (slug) => {
    if (!confirm('Delete this product?')) return;
    try { await api.delete(`/admin/products/${slug}`); toast.success('Product deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Products</h2>
        <button onClick={openCreate} className="rounded-lg bg-violet-600 px-4 py-2 text-white">Add Product</button>
      </div>

      {showForm && (
        <form onSubmit={save} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950 grid gap-3 md:grid-cols-2" noValidate>
          <h3 className="md:col-span-2 font-semibold">{editing ? 'Edit Product' : 'New Product'}</h3>
          <div>
            <label className="mb-1 block text-sm">Name</label>
            <input required placeholder="Name" value={form.name} onChange={(e) => updateField('name', e.target.value)} className="w-full rounded border px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
            <FieldError errors={errors} name="name" />
          </div>
          <div>
            <label className="mb-1 block text-sm">SKU</label>
            <input required placeholder="SKU" value={form.sku} onChange={(e) => updateField('sku', e.target.value)} className="w-full rounded border px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
            <FieldError errors={errors} name="sku" />
          </div>
          <div>
            <label className="mb-1 block text-sm">Category</label>
            <select required value={form.category_id} onChange={(e) => updateField('category_id', e.target.value)} className="w-full rounded border px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
              <option value="">Select Category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <FieldError errors={errors} name="category_id" />
          </div>
          <div>
            <label className="mb-1 block text-sm">Brand</label>
            <select value={form.brand_id} onChange={(e) => updateField('brand_id', e.target.value)} className="w-full rounded border px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
              <option value="">No Brand</option>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <FieldError errors={errors} name="brand_id" />
          </div>
          <div>
            <label className="mb-1 block text-sm">Price</label>
            <input required type="number" step="0.01" placeholder="Price" value={form.price} onChange={(e) => updateField('price', e.target.value)} className="w-full rounded border px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
            <FieldError errors={errors} name="price" />
          </div>
          <div>
            <label className="mb-1 block text-sm">Sale Price (optional)</label>
            <input type="number" step="0.01" placeholder="Sale Price" value={form.sale_price} onChange={(e) => updateField('sale_price', e.target.value)} className="w-full rounded border px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
            <FieldError errors={errors} name="sale_price" />
          </div>
          <div>
            <label className="mb-1 block text-sm">Stock Quantity</label>
            <input required type="number" placeholder="Stock Quantity" value={form.stock_quantity} onChange={(e) => updateField('stock_quantity', e.target.value)} className="w-full rounded border px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
            <FieldError errors={errors} name="stock_quantity" />
          </div>
          <div>
            <label className="mb-1 block text-sm">Thumbnail URL</label>
            <input placeholder="Thumbnail URL" value={form.thumbnail_url} onChange={(e) => updateField('thumbnail_url', e.target.value)} className="w-full rounded border px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
            <FieldError errors={errors} name="thumbnail_url" />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm">Short description</label>
            <input placeholder="Short description" value={form.short_description} onChange={(e) => updateField('short_description', e.target.value)} className="w-full rounded border px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
            <FieldError errors={errors} name="short_description" />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm">Description</label>
            <textarea placeholder="Description" value={form.description} onChange={(e) => updateField('description', e.target.value)} className="w-full rounded border px-3 py-2 dark:border-slate-700 dark:bg-slate-900" rows={3} />
            <FieldError errors={errors} name="description" />
          </div>
          <div className="flex items-center gap-4 md:col-span-2">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={(e) => updateField('is_active', e.target.checked)} /> Active</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_featured} onChange={(e) => updateField('is_featured', e.target.checked)} /> Featured</label>
          </div>
          <div className="md:col-span-2 flex gap-2">
            <button className="rounded-lg bg-violet-600 px-4 py-2 text-white">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border px-4 py-2 dark:border-slate-700">Cancel</button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left dark:bg-slate-900"><tr><th className="p-3">Name</th><th>SKU</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? <tr><td className="p-3" colSpan="7">Loading...</td></tr> : products.map((p) => (
              <tr key={p.id} className="border-t dark:border-slate-800">
                <td className="p-3 font-medium">{p.name}</td>
                <td>{p.sku}</td>
                <td>{p.category?.name || '-'}</td>
                <td>${Number(p.sale_price ?? p.price).toFixed(2)}</td>
                <td>{p.stock_quantity}</td>
                <td>{p.is_active ? 'Active' : 'Inactive'}</td>
                <td className="space-x-2 py-2">
                  <button onClick={() => openEdit(p)} className="text-violet-600 hover:underline">Edit</button>
                  <button onClick={() => remove(p.slug)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {!loading && products.length === 0 && <tr><td className="p-3" colSpan="7">No products.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
