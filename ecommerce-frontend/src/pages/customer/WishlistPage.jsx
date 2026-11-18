import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import ProductCard from '../../components/products/ProductCard';
import { toast } from 'sonner';

export default function WishlistPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data } = await api.get('/wishlist');
      setItems(data.data || []);
    } catch {
      toast.error('Unable to load your wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    try {
      await api.delete(`/wishlist/items/${id}`);
      setItems((previous) => previous.filter((item) => item.id !== id));
      toast.success('Removed from wishlist');
    } catch {
      toast.error('Failed to remove item');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Wishlist</h1>
      {loading ? (
        <p>Loading...</p>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center dark:border-slate-700">
          <p className="text-slate-500">Your wishlist is empty.</p>
          <Link
            to="/shop"
            className="mt-4 inline-block rounded-lg bg-blue-600 px-5 py-2 text-white"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <ProductCard product={item.product} />
              <button
                type="button"
                onClick={() => remove(item.id)}
                className="mt-3 w-full rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/30"
              >
                Remove from wishlist
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
