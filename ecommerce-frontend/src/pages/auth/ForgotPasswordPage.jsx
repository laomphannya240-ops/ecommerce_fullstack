import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { toast } from 'sonner';
import FieldError from '../../components/forms/FieldError';
import { clearFieldError, getErrorMessage, getFieldErrors } from '../../utils/validation';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const { data } = await api.post('/forgot-password', { email });
      toast.success(data.message || 'If the email exists, a reset link has been sent.');
    } catch (err) {
      setErrors(getFieldErrors(err));
      toast.error(getErrorMessage(err, 'Failed to send reset link'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-bold">Forgot Password</h1>
        <p className="mt-1 text-sm text-slate-500">Enter your email to receive a password reset link.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          <div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((previous) => clearFieldError(previous, 'email'));
              }}
              placeholder="Email address"
              className="w-full rounded-md border px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
            />
            <FieldError errors={errors} name="email" />
          </div>
          <button disabled={loading} className="w-full rounded-lg bg-violet-600 py-2.5 font-semibold text-white hover:bg-violet-700 disabled:opacity-50">{loading ? 'Sending...' : 'Send Reset Link'}</button>
        </form>
        <Link to="/login" className="mt-4 block text-center text-sm text-violet-600 hover:underline">Back to Login</Link>
      </div>
    </div>
  );
}
