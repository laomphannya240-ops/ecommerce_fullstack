import { Link, useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { toast } from 'sonner';

export default function CartPage() {
  const { cart, loading, updateItem, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  const items = cart?.items || [];
  const subtotal = Number(cart?.subtotal || 0);
  const shippingFee = Number(cart?.shipping_fee || 0);
  const total = Number(cart?.total || subtotal + shippingFee);

  const onQty = async (item, qty) => {
    const next = Math.max(1, Number(qty) || 1);
    if (next === item.quantity) return;

    try {
      await updateItem(item.id, next);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update cart');
    }
  };

  const onRemove = async (itemId) => {
    try {
      await removeItem(itemId);
      toast.success('Item removed');
    } catch {
      toast.error('Failed to remove item');
    }
  };

  if (loading && items.length === 0) {
    return <div className="mx-auto max-w-7xl px-4 py-10">Loading cart...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Shopping Cart</h1>
      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center dark:border-slate-700">
          <p className="text-slate-500">Your cart is empty.</p>
          <Link to="/shop" className="mt-4 inline-block rounded-lg bg-violet-600 px-5 py-2 text-white">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {items.map((item) => {
              const product = item.product || {};
              const image =
                product.thumbnail_url ||
                product.images?.[0]?.image_url ||
                'https://placehold.co/100x100/png?text=Product';

              return (
                <div
                  key={item.id}
                  className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                >
                  <img src={image} alt={product.name} className="h-24 w-24 rounded-md object-cover" />
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <Link to={`/products/${product.slug}`} className="font-semibold hover:text-violet-600">
                        {product.name || 'Product'}
                      </Link>
                      <p className="text-sm text-slate-500">
                        ${Number(item.unit_price).toFixed(2)} each
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="1"
                        max={product.stock_quantity || undefined}
                        value={item.quantity}
                        onChange={(event) => onQty(item, event.target.value)}
                        className="w-20 rounded border px-2 py-1 dark:border-slate-700 dark:bg-slate-950"
                      />
                      <button
                        type="button"
                        onClick={() => onRemove(item.id)}
                        className="text-red-500 hover:text-red-600"
                        title="Remove item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="font-semibold">${Number(item.total_price).toFixed(2)}</div>
                </div>
              );
            })}
            <button
              type="button"
              onClick={async () => {
                await clearCart();
                toast.success('Cart cleared');
              }}
              className="text-sm text-red-500 hover:underline"
            >
              Clear cart
            </button>
          </div>

          <aside className="h-fit rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold">Order Summary</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shippingFee === 0 ? 'Free' : `$${shippingFee.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-base font-semibold dark:border-slate-700">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/checkout')}
              className="mt-5 w-full rounded-lg bg-violet-600 py-2.5 font-semibold text-white hover:bg-violet-700"
            >
              Proceed to Checkout
            </button>
            <Link to="/shop" className="mt-3 block text-center text-sm text-violet-600 hover:underline">
              Continue Shopping
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
