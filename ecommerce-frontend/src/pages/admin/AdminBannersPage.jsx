import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { toast } from 'sonner';
import FieldError from '../../components/forms/FieldError';
import { clearFieldError, getErrorMessage, getFieldErrors } from '../../utils/validation';

const empty = { title: '', subtitle: '', image_path: '', link_url: '', position: 'home_hero', sort_order: 0, is_active: true };

export default function AdminBannersPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  const load = () => api.get('/admin/banners').then((r) => setItems(r.data.data || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const updateField = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => clearFieldError(previous, field));
  };

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      await api.post('/admin/banners', form);
      toast.success('Banner created');
      setForm(empty);
      load();
    } catch (err) {
      setErrors(getFieldErrors(err));
      toast.error(getErrorMessage(err, 'Failed'));
    }
  };

  const remove = async (id) => { if (!confirm('Delete banner?')) return; try { await api.delete(`/admin/banners/${id}`); load(); } catch { toast.error('Delete failed'); } };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Banners</h2>
      <form onSubmit={submit} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-2 dark:border-slate-800 dark:bg-slate-950" noValidate>
        <div>
          <input required placeholder="Title" value={form.title} onChange={(e) => updateField('title', e.target.value)} className="w-full rounded border px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
          <FieldError errors={errors} name="title" />
        </div>
        <div>
          <input placeholder="Subtitle" value={form.subtitle} onChange={(e) => updateField('subtitle', e.target.value)} className="w-full rounded border px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
          <FieldError errors={errors} name="subtitle" />
        </div>
        <div>
          <input required placeholder="Image URL/path" value={form.image_path} onChange={(e) => updateField('image_path', e.target.value)} className="w-full rounded border px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
          <FieldError errors={errors} name="image_path" />
        </div>
        <div>
          <input placeholder="Link URL" value={form.link_url} onChange={(e) => updateField('link_url', e.target.value)} className="w-full rounded border px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
          <FieldError errors={errors} name="link_url" />
        </div>
        <div>
          <input placeholder="Position" value={form.position} onChange={(e) => updateField('position', e.target.value)} className="w-full rounded border px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
          <FieldError errors={errors} name="position" />
        </div>
        <div>
          <input type="number" placeholder="Sort order" value={form.sort_order} onChange={(e) => updateField('sort_order', Number(e.target.value))} className="w-full rounded border px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
          <FieldError errors={errors} name="sort_order" />
        </div>
        <button className="rounded bg-violet-600 px-4 py-2 text-white md:col-span-2">Create Banner</button>
      </form>
      <div className="grid gap-4 md:grid-cols-2">
        {loading ? <p>Loading...</p> : items.map((b) => (
          <div key={b.id} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
            <img src={b.image_url || b.image_path} alt={b.title} className="h-40 w-full rounded object-cover" />
            <h3 className="mt-2 font-semibold">{b.title}</h3>
            <p className="text-sm text-slate-500">{b.position} • {b.is_active ? 'Active' : 'Inactive'}</p>
            <button onClick={() => remove(b.id)} className="mt-2 text-sm text-red-600">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
