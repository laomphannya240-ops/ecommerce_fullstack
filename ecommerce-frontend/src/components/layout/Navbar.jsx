import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Moon, ShoppingCart, Sun, Heart, User, Menu, X, Globe, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cart } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { lang, changeLang, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const onSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setOpen(false);
    }
  };

  const navLinkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'}`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="text-xl font-bold text-blue-600">LumenStore</Link>

        <nav className="hidden items-center gap-1 lg:flex">
          <NavLink to="/" className={navLinkClass}>{t('home')}</NavLink>
          <NavLink to="/shop" className={navLinkClass}>{t('shop')}</NavLink>
          <NavLink to="/categories" className={navLinkClass}>{t('categories')}</NavLink>
        </nav>

        {/* <form onSubmit={onSearch} className="hidden flex-1 max-w-md md:block">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search')}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
        </form> */}

        <div className="hidden items-center gap-2 md:flex">
          <button onClick={toggleTheme} className="rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800" title={theme === 'dark' ? t('lightMode') : t('darkMode')}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={() => changeLang(lang === 'en' ? 'km' : 'en')} className="rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800" title={t('language')}>
            <Globe size={18} />
          </button>
          <Link to="/wishlist" className="rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800"><Heart size={18} /></Link>
          <Link to="/cart" className="relative rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
            <ShoppingCart size={18} />
            {cart?.item_count > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-blue-600 px-1.5 text-xs text-white">{cart.item_count}</span>}
          </Link>
          {isAuthenticated ? (
            <>
              {isAdmin && <Link to="/admin" className="rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800" title="Admin"><LayoutDashboard size={18} /></Link>}
              <Link to="/account" className="rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800" title={user?.name}><User size={18} /></Link>
              <button onClick={logout} className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white dark:bg-slate-100 dark:text-slate-900">{t('logout')}</button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-md px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">{t('login')}</Link>
              <Link to="/register" className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white">{t('register')}</Link>
            </>
          )}
        </div>

        <button className="md:hidden rounded-md p-2" onClick={() => setOpen((v) => !v)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 px-4 py-3 md:hidden dark:border-slate-800">
          <form onSubmit={onSearch} className="mb-3">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('search')} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" />
          </form>
          <div className="flex flex-col gap-2">
            <Link to="/" onClick={() => setOpen(false)}>{t('home')}</Link>
            <Link to="/shop" onClick={() => setOpen(false)}>{t('shop')}</Link>
            <Link to="/categories" onClick={() => setOpen(false)}>{t('categories')}</Link>
            <Link to="/cart" onClick={() => setOpen(false)}>{t('cart')}</Link>
            <Link to="/wishlist" onClick={() => setOpen(false)}>{t('wishlist')}</Link>
            {isAuthenticated ? (
              <>
                <Link to="/account" onClick={() => setOpen(false)}>{t('myAccount')}</Link>
                {isAdmin && <Link to="/admin" onClick={() => setOpen(false)}>Admin</Link>}
                <button onClick={() => { logout(); setOpen(false); }} className="text-left">{t('logout')}</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)}>{t('login')}</Link>
                <Link to="/register" onClick={() => setOpen(false)}>{t('register')}</Link>
              </>
            )}
            <div className="flex gap-2 pt-2">
              <button onClick={toggleTheme} className="rounded border px-3 py-1 text-sm dark:border-slate-700">{theme === 'dark' ? 'Light' : 'Dark'}</button>
              <button onClick={() => changeLang(lang === 'en' ? 'km' : 'en')} className="rounded border px-3 py-1 text-sm dark:border-slate-700">{lang === 'en' ? 'KM' : 'EN'}</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
