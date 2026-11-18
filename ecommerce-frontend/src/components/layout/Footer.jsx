import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-4">
        <div>
          <h3 className="text-lg font-bold text-blue-600">LumenStore</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Modern e-commerce experience with secure checkout and fast delivery.</p>
        </div>
        <div>
          <h4 className="font-semibold">Shop</h4>
          <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400">
            <li><Link to="/shop">All Products</Link></li>
            <li><Link to="/categories">Categories</Link></li>
            <li><Link to="/cart">Cart</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold">Account</h4>
          <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400">
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
            <li><Link to="/account/orders">My Orders</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold">Company</h4>
          <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400">
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200 py-4 text-center text-sm text-slate-500 dark:border-slate-800">
        © {new Date().getFullYear()} LumenStore. All rights reserved.
      </div>
    </footer>
  );
}
