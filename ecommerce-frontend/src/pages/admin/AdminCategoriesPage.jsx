import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { toast } from 'sonner';
import FieldError from '../../components/forms/FieldError';
import { clearFieldError, getErrorMessage, getFieldErrors } from '../../utils/validation';

const empty = { name: '', description: '', image: '', sort_order: 0, is_active: true };

export default function AdminCategoriesPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => api.get('/admin/categories').then((r) => setItems(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const updateField = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => clearFieldError(previous, field));
  };

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      if (editing) await api.put(`/admin/categories/${editing.slug}`, form);
      else await api.post('/admin/categories', form);
      toast.success(editing ? 'Category updated' : 'Category created');
      setForm(empty); setEditing(null); load();
    } catch (err) {
      setErrors(getFieldErrors(err));
      toast.error(getErrorMessage(err, 'Save failed'));
    }
  };

  const edit = (c) => { setEditing(c); setForm({ name: c.name, description: c.description || '', image: c.image || '', sort_order: c.sort_order || 0, is_active: !!c.is_active }); setErrors({}); };
  const remove = async (slug) => { if (!confirm('Delete category?')) return; try { await api.delete(`/admin/categories/${slug}`); toast.success('Deleted'); load(); } catch (err) { toast.error(getErrorMessage(err, 'Delete failed')); } };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Categories</h2>
      <form onSubmit={submit} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-2 dark:border-slate-800 dark:bg-slate-950" noValidate>
        <div>
          <input required placeholder="Name" value={form.name} onChange={(e) => updateField('name', e.target.value)} className="w-full rounded border px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
          <FieldError errors={errors} name="name" />
        </div>
        <div>
          <input type="number" placeholder="Sort order" value={form.sort_order} onChange={(e) => updateField('sort_order', Number(e.target.value))} className="w-full rounded border px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
          <FieldError errors={errors} name="sort_order" />
        </div>
        <div className="md:col-span-2">
          <input placeholder="Image URL" value={form.image} onChange={(e) => updateField('image', e.target.value)} className="w-full rounded border px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
          <FieldError errors={errors} name="image" />
        </div>
        <div className="md:col-span-2">
          <textarea placeholder="Description" value={form.description} onChange={(e) => updateField('description', e.target.value)} className="w-full rounded border px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
          <FieldError errors={errors} name="description" />
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={(e) => updateField('is_active', e.target.checked)} /> Active</label>
        <div className="flex gap-2">
          <button className="rounded bg-violet-600 px-4 py-2 text-white">{editing ? 'Update' : 'Create'}</button>
          {editing && <button type="button" onClick={() => { setEditing(null); setForm(empty); setErrors({}); }} className="rounded border px-4 py-2 dark:border-slate-700">Cancel</button>}
        </div>
      </form>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <table className="w-full text-sm"><thead className="bg-slate-50 text-left dark:bg-slate-900"><tr><th className="p-3">Name</th><th>Slug</th><th>Products</th><th>Active</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? <tr><td className="p-3" colSpan="5">Loading...</td></tr> : items.map((c) => (
              <tr key={c.id} className="border-t dark:border-slate-800"><td className="p-3">{c.name}</td><td>{c.slug}</td><td>{c.products_count ?? 0}</td><td>{c.is_active ? 'Yes' : 'No'}</td>
                <td className="space-x-2 py-2"><button onClick={() => edit(c)} className="text-violet-600">Edit</button><button onClick={() => remove(c.slug)} className="text-red-600">Delete</button></td></tr>
            ))}
            {!loading && items.length === 0 && <tr><td className="p-3" colSpan="5">No categories.</td></tr>}
          </tbody></table>
      </div>
    </div>
  );
}
