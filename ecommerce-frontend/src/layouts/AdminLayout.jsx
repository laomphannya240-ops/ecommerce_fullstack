import { Link, NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Package, Tags, Shapes, ShoppingBag, Users, CreditCard, TicketPercent, Image, BarChart3, LogOut, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const nav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: Shapes },
  { to: '/admin/brands', label: 'Brands', icon: Tags },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/payments', label: 'Payments', icon: CreditCard },
  { to: '/admin/coupons', label: 'Coupons', icon: TicketPercent },
  { to: '/admin/banners', label: 'Banners', icon: Image },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
];

export default function AdminLayout() {
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 md:flex">
          <div className="mb-6">
            <Link to="/admin" className="text-xl font-bold text-violet-600">Admin Panel</Link>
            <p className="text-xs text-slate-500 mt-1">{user?.name}</p>
          </div>
          <nav className="flex-1 space-y-1">
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `flex items-center gap-2 rounded-md px-3 py-2 text-sm ${isActive ? 'bg-violet-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                  <Icon size={16} /> {item.label}
                </NavLink>
              );
            })}
          </nav>
          <div className="space-y-1 border-t border-slate-200 pt-4 dark:border-slate-800">
            <Link to="/" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"><Store size={16} /> View Store</Link>
            <button onClick={logout} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"><LogOut size={16} /> Logout</button>
          </div>
        </aside>
        <div className="flex-1">
          <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
            <h1 className="font-semibold">E-commerce Administration</h1>
            <div className="flex items-center gap-2 md:hidden">
              <Link to="/" className="text-sm text-violet-600">Store</Link>
            </div>
          </header>
          <main className="p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
