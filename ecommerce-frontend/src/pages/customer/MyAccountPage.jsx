import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { toast } from 'sonner';
import FieldError from '../../components/forms/FieldError';
import { clearFieldError, getErrorMessage, getFieldErrors } from '../../utils/validation';

function mapPasswordErrors(fieldErrors) {
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

export default function MyAccountPage() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [pwd, setPwd] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const onProfileChange = (event) => {
    const { name, value } = event.target;

    setProfile((previous) => ({ ...previous, [name]: value }));
    setProfileErrors((previous) => clearFieldError(previous, name));
  };

  const onPasswordChange = (event) => {
    const { name, value } = event.target;

    setPwd((previous) => ({ ...previous, [name]: value }));
    setPasswordErrors((previous) => clearFieldError(previous, name));
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileErrors({});
    setSaving(true);

    try {
      const { data } = await api.put('/user/profile', profile);
      setUser(data.data);
      toast.success('Profile updated');
    } catch (err) {
      setProfileErrors(getFieldErrors(err));
      toast.error(getErrorMessage(err, 'Update failed'));
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPasswordErrors({});
    setChangingPassword(true);

    try {
      await api.put('/user/password', pwd);
      setPwd({ current_password: '', password: '', password_confirmation: '' });
      toast.success('Password changed');
    } catch (err) {
      setPasswordErrors(mapPasswordErrors(getFieldErrors(err)));
      toast.error(getErrorMessage(err, 'Failed to change password'));
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">My Account</h1>
      <div className="mb-6 flex flex-wrap gap-3">
        <Link to="/account/orders" className="rounded-lg border px-4 py-2 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">My Orders</Link>
        <Link to="/wishlist" className="rounded-lg border px-4 py-2 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">Wishlist</Link>
        <Link to="/cart" className="rounded-lg border px-4 py-2 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">Cart</Link>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <form onSubmit={saveProfile} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900" noValidate>
          <h2 className="mb-4 text-lg font-semibold">Profile Information</h2>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm" htmlFor="profile-name">Name</label>
              <input id="profile-name" name="name" value={profile.name} onChange={onProfileChange} className="w-full rounded border px-3 py-2 dark:border-slate-700 dark:bg-slate-950" />
              <FieldError errors={profileErrors} name="name" />
            </div>
            <div>
              <label className="mb-1 block text-sm" htmlFor="profile-email">Email</label>
              <input id="profile-email" value={user?.email || ''} disabled className="w-full rounded border px-3 py-2 bg-slate-50 dark:border-slate-700 dark:bg-slate-800" />
            </div>
            <div>
              <label className="mb-1 block text-sm" htmlFor="profile-phone">Phone</label>
              <input id="profile-phone" name="phone" value={profile.phone || ''} onChange={onProfileChange} className="w-full rounded border px-3 py-2 dark:border-slate-700 dark:bg-slate-950" />
              <FieldError errors={profileErrors} name="phone" />
            </div>
            <button disabled={saving} className="rounded-lg bg-violet-600 px-4 py-2 text-white disabled:opacity-50">{saving ? 'Saving...' : 'Save Profile'}</button>
          </div>
        </form>

        <form onSubmit={changePassword} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900" noValidate>
          <h2 className="mb-4 text-lg font-semibold">Change Password</h2>
          <div className="space-y-3">
            <div>
              <input name="current_password" type="password" placeholder="Current password" value={pwd.current_password} onChange={onPasswordChange} className="w-full rounded border px-3 py-2 dark:border-slate-700 dark:bg-slate-950" />
              <FieldError errors={passwordErrors} name="current_password" />
            </div>
            <div>
              <input name="password" type="password" placeholder="New password" value={pwd.password} onChange={onPasswordChange} className="w-full rounded border px-3 py-2 dark:border-slate-700 dark:bg-slate-950" />
              <FieldError errors={passwordErrors} name="password" />
            </div>
            <div>
              <input name="password_confirmation" type="password" placeholder="Confirm new password" value={pwd.password_confirmation} onChange={onPasswordChange} className="w-full rounded border px-3 py-2 dark:border-slate-700 dark:bg-slate-950" />
              <FieldError errors={passwordErrors} name="password_confirmation" />
            </div>
            <button disabled={changingPassword} className="rounded-lg bg-slate-900 px-4 py-2 text-white disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900">{changingPassword ? 'Updating...' : 'Update Password'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
