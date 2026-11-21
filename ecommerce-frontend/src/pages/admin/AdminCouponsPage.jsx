import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { toast } from 'sonner';
import FieldError from '../../components/forms/FieldError';
import { clearFieldError, getErrorMessage, getFieldErrors } from '../../utils/validation';

const empty = { code: '', type: 'percent', value: 10, min_order_amount: '', max_discount_amount: '', usage_limit: '', is_active: true };

export default function AdminCouponsPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  const load = () => api.get('/admin/coupons').then((r) => setItems(r.data.data?.data || r.data.data || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const updateField = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => clearFieldError(previous, field));
  };

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      const payload = { ...form, min_order_amount: form.min_order_amount || null, max_discount_amount: form.max_discount_amount || null, usage_limit: form.usage_limit || null };
      await api.post('/admin/coupons', payload);
      toast.success('Coupon created'); setForm(empty); load();
    } catch (err) {
      setErrors(getFieldErrors(err));
      toast.error(getErrorMessage(err, 'Failed'));
    }
  };

  const remove = async (id) => { if (!confirm('Delete coupon?')) return; try { await api.delete(`/admin/coupons/${id}`); load(); } catch { toast.error('Delete failed'); } };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Coupons</h2>
      <form onSubmit={submit} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-3 dark:border-slate-800 dark:bg-slate-950" noValidate>
        <div>
          <input required placeholder="Code" value={form.code} onChange={(e) => updateField('code', e.target.value.toUpperCase())} className="w-full rounded border px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
          <FieldError errors={errors} name="code" />
        </div>
        <div>
          <select value={form.type} onChange={(e) => updateField('type', e.target.value)} className="w-full rounded border px-3 py-2 dark:border-slate-700 dark:bg-slate-900"><option value="percent">Percent</option><option value="fixed">Fixed</option></select>
          <FieldError errors={errors} name="type" />
        </div>
        <div>
          <input required type="number" step="0.01" placeholder="Value" value={form.value} onChange={(e) => updateField('value', e.target.value)} className="w-full rounded border px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
          <FieldError errors={errors} name="value" />
        </div>
        <div>
          <input type="number" step="0.01" placeholder="Min order" value={form.min_order_amount} onChange={(e) => updateField('min_order_amount', e.target.value)} className="w-full rounded border px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
          <FieldError errors={errors} name="min_order_amount" />
        </div>
        <div>
          <input type="number" step="0.01" placeholder="Max discount" value={form.max_discount_amount} onChange={(e) => updateField('max_discount_amount', e.target.value)} className="w-full rounded border px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
          <FieldError errors={errors} name="max_discount_amount" />
        </div>
        <div>
          <input type="number" placeholder="Usage limit" value={form.usage_limit} onChange={(e) => updateField('usage_limit', e.target.value)} className="w-full rounded border px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
          <FieldError errors={errors} name="usage_limit" />
        </div>
        <button className="rounded bg-violet-600 px-4 py-2 text-white md:col-span-3">Create Coupon</button>
      </form>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <table className="w-full text-sm"><thead className="bg-slate-50 text-left dark:bg-slate-900"><tr><th className="p-3">Code</th><th>Type</th><th>Value</th><th>Used</th><th>Active</th><th>Actions</th></tr></thead>
          <tbody>{loading ? <tr><td className="p-3" colSpan="6">Loading...</td></tr> : items.map((c) => (
            <tr key={c.id} className="border-t dark:border-slate-800"><td className="p-3 font-medium">{c.code}</td><td>{c.type}</td><td>{c.value}</td><td>{c.used_count}</td><td>{c.is_active ? 'Yes' : 'No'}</td><td><button onClick={() => remove(c.id)} className="text-red-600">Delete</button></td></tr>))}</tbody></table>
      </div>
    </div>
  );
}
