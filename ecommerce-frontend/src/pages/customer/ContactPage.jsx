import { useState } from 'react';
import { toast } from 'sonner';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const onSubmit = (e) => {
    e.preventDefault();
    toast.success('Thank you! Your message has been received.');
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold">Contact Us</h1>
      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <input required placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded border px-3 py-2 dark:border-slate-700 dark:bg-slate-950" />
          <input required type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded border px-3 py-2 dark:border-slate-700 dark:bg-slate-950" />
          <textarea required rows={5} placeholder="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full rounded border px-3 py-2 dark:border-slate-700 dark:bg-slate-950" />
          <button className="rounded-lg bg-blue-600 px-5 py-2 text-white">Send Message</button>
        </form>
        <div className="space-y-4 text-slate-600 dark:text-slate-400">
          <div className="rounded-xl border p-5 dark:border-slate-800"><h3 className="font-semibold text-slate-900 dark:text-slate-100">Address</h3><p className="mt-1 text-sm">Phnom Penh, Cambodia</p></div>
          <div className="rounded-xl border p-5 dark:border-slate-800"><h3 className="font-semibold text-slate-900 dark:text-slate-100">Email</h3><p className="mt-1 text-sm">support@lumenstore.example</p></div>
          <div className="rounded-xl border p-5 dark:border-slate-800"><h3 className="font-semibold text-slate-900 dark:text-slate-100">Phone</h3><p className="mt-1 text-sm">+855 12 345 678</p></div>
        </div>
      </div>
    </div>
  );
}
