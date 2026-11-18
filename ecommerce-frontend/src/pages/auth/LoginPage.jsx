import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import FieldError from '../../components/forms/FieldError';
import { clearFieldError, getErrorMessage, getFieldErrors } from '../../utils/validation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const user = await login({ email, password });
      toast.success('Welcome back!');
      if (user.role === 'admin' && from === '/') navigate('/admin');
      else navigate(from, { replace: true });
    } catch (err) {
      setErrors(getFieldErrors(err));
      toast.error(getErrorMessage(err, 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-bold">Login</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in to your account</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((previous) => clearFieldError(previous, 'email'));
              }}
              className="w-full rounded-md border px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
            />
            <FieldError errors={errors} name="email" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((previous) => clearFieldError(previous, 'password'));
              }}
              className="w-full rounded-md border px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
            />
            <FieldError errors={errors} name="password" />
          </div>
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">Forgot password?</Link>
          </div>
          <button disabled={loading} className="w-full rounded-lg bg-blue-600 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{loading ? 'Signing in...' : 'Login'}</button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">Don't have an account? <Link to="/register" className="text-blue-600 hover:underline">Register</Link></p>
        <div className="mt-4 rounded-md bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-800">
          <p><strong>Demo Admin:</strong> admin@lumen.test / password</p>
          <p><strong>Demo Customer:</strong> customer@lumen.test / password</p>
        </div>
      </div>
    </div>
  );
}
