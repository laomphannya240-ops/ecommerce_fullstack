import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { toast } from 'sonner';
import FieldError from '../../components/forms/FieldError';
import { clearFieldError, getErrorMessage, getFieldErrors } from '../../utils/validation';

const empty = { name: '', logo: '', description: '', is_active: true };

export default function AdminBrandsPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => api.get('/admin/brands').then((r) => setItems(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const updateField = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => clearFieldError(previous, field));
  };

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      if (editing) await api.put(`/admin/brands/${editing.slug}`, form); else await api.post('/admin/brands', form);
      toast.success('Saved'); setEditing(null); setForm(empty); load();
    } catch (err) {
      setErrors(getFieldErrors(err));
      toast.error(getErrorMessage(err, 'Save failed'));
    }
  };

  const edit = (b) => { setEditing(b); setForm({ name: b.name, logo: b.logo || '', description: b.description || '', is_active: !!b.is_active }); setErrors({}); };
  const remove = async (slug) => { if (!confirm('Delete brand?')) return; try { await api.delete(`/admin/brands/${slug}`); load(); toast.success('Deleted'); } catch (err) { toast.error(getErrorMessage(err, 'Delete failed')); } };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Brands</h2>
      <form onSubmit={submit} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-2 dark:border-slate-800 dark:bg-slate-950" noValidate>
        <div>
          <input required placeholder="Name" value={form.name} onChange={(e) => updateField('name', e.target.value)} className="w-full rounded border px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
          <FieldError errors={errors} name="name" />
        </div>
        <div>
          <input placeholder="Logo URL" value={form.logo} onChange={(e) => updateField('logo', e.target.value)} className="w-full rounded border px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
          <FieldError errors={errors} name="logo" />
        </div>
        <div className="md:col-span-2">
          <textarea placeholder="Description" value={form.description} onChange={(e) => updateField('description', e.target.value)} className="w-full rounded border px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
          <FieldError errors={errors} name="description" />
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={(e) => updateField('is_active', e.target.checked)} /> Active</label>
        <div className="flex gap-2">
          <button className="rounded bg-blue-600 px-4 py-2 text-white">{editing ? 'Update' : 'Create'}</button>
          {editing && <button type="button" onClick={() => { setEditing(null); setForm(empty); setErrors({}); }} className="rounded border px-4 py-2 dark:border-slate-700">Cancel</button>}
        </div>
      </form>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <table className="w-full text-sm"><thead className="bg-slate-50 text-left dark:bg-slate-900"><tr><th className="p-3">Name</th><th>Slug</th><th>Products</th><th>Active</th><th>Actions</th></tr></thead>
          <tbody>{loading ? <tr><td className="p-3" colSpan="5">Loading...</td></tr> : items.map((b) => (
            <tr key={b.id} className="border-t dark:border-slate-800"><td className="p-3">{b.name}</td><td>{b.slug}</td><td>{b.products_count ?? 0}</td><td>{b.is_active ? 'Yes' : 'No'}</td>
              <td className="space-x-2 py-2"><button onClick={() => edit(b)} className="text-blue-600">Edit</button><button onClick={() => remove(b.slug)} className="text-red-600">Delete</button></td></tr>))}</tbody>
        </table>
      </div>
    </div>
  );
}
