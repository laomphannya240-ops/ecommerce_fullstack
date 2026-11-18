import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { toast } from 'sonner';

export default function ProductCard({ product }) {
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();

  const price = product.sale_price ?? product.price;
  const hasSale = !!product.sale_price;

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }
    try {
      await addItem(product.id, 1);
      toast.success('Added to cart');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  const image = product.thumbnail_url || product.images?.[0]?.image_url || 'https://placehold.co/400x400/png?text=Product';

  return (
    <Link to={`/products/${product.slug}`} className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img src={image} alt={product.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
      </div>
      <div className="p-4">
        <p className="text-xs text-slate-500">{product.category?.name || 'Product'}</p>
        <h3 className="mt-1 line-clamp-2 font-semibold">{product.name}</h3>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-lg font-bold text-blue-600">${Number(price).toFixed(2)}</span>
          {hasSale && <span className="text-sm text-slate-400 line-through">${Number(product.price).toFixed(2)}</span>}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className={`text-xs ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {product.stock_quantity > 0 ? `In stock (${product.stock_quantity})` : 'Out of stock'}
          </span>
          <button onClick={handleAdd} disabled={product.stock_quantity <= 0} className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
            <ShoppingCart size={14} /> Add
          </button>
        </div>
      </div>
    </Link>
  );
}
