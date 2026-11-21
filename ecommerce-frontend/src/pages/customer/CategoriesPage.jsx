import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/categories').then((r) => setCategories(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Categories</h1>
      {loading ? <p>Loading...</p> : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {categories.map((cat) => (
            <Link key={cat.id} to={`/shop?category=${cat.slug || cat.id}`} className="rounded-xl border border-slate-200 bg-white p-6 text-center hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-violet-50 text-3xl dark:bg-slate-800">🗂️</div>
              <h3 className="font-semibold">{cat.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{cat.description || `${cat.products_count ?? 0} products`}</p>
            </Link>
          ))}
          {categories.length === 0 && <p className="text-slate-500">No categories found.</p>}
        </div>
      )}
    </div>
  );
}
