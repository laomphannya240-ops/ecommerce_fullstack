import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import FieldError from '../../components/forms/FieldError';
import { clearFieldError, getErrorMessage, getFieldErrors } from '../../utils/validation';

function mapRegistrationErrors(fieldErrors) {
  const mapped = { ...fieldErrors };
  const confirmationMessages = (mapped.password || []).filter((message) =>
    /confirmation/i.test(message),
  );

  if (confirmationMessages.length > 0) {
    mapped.password_confirmation = [
      ...(mapped.password_confirmation || []),
      ...confirmationMessages,
    ];
    mapped.password = mapped.password.filter((message) => !/confirmation/i.test(message));

    if (mapped.password.length === 0) {
      delete mapped.password;
    }
  }

  return mapped;
}

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', password_confirmation: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const onChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => clearFieldError(previous, name));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      await register(form);
      toast.success('Account created successfully');
      navigate('/');
    } catch (err) {
      setErrors(mapRegistrationErrors(getFieldErrors(err)));
      toast.error(getErrorMessage(err, 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-bold">Create Account</h1>
        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="name">Full Name</label>
            <input id="name" name="name" required value={form.name} onChange={onChange} className="w-full rounded-md border px-3 py-2 dark:border-slate-700 dark:bg-slate-950" />
            <FieldError errors={errors} name="name" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="email">Email</label>
            <input id="email" type="email" name="email" required value={form.email} onChange={onChange} className="w-full rounded-md border px-3 py-2 dark:border-slate-700 dark:bg-slate-950" />
            <FieldError errors={errors} name="email" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="phone">Phone</label>
            <input id="phone" name="phone" value={form.phone} onChange={onChange} className="w-full rounded-md border px-3 py-2 dark:border-slate-700 dark:bg-slate-950" />
            <FieldError errors={errors} name="phone" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="password">Password</label>
            <input id="password" type="password" name="password" required value={form.password} onChange={onChange} className="w-full rounded-md border px-3 py-2 dark:border-slate-700 dark:bg-slate-950" />
            <FieldError errors={errors} name="password" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="password_confirmation">Confirm Password</label>
            <input id="password_confirmation" type="password" name="password_confirmation" required value={form.password_confirmation} onChange={onChange} className="w-full rounded-md border px-3 py-2 dark:border-slate-700 dark:bg-slate-950" />
            <FieldError errors={errors} name="password_confirmation" />
          </div>
          <button disabled={loading} className="w-full rounded-lg bg-blue-600 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{loading ? 'Creating...' : 'Register'}</button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login</Link></p>
      </div>
    </div>
  );
}
