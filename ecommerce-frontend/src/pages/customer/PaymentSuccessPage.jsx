import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function PaymentSuccessPage() {
  const [params] = useSearchParams();
  const orderNumber = params.get('order');

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <CheckCircle className="mx-auto text-green-500" size={64} />
      <h1 className="mt-4 text-3xl font-bold">Order Placed</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        Thank you! Your order has been placed successfully.
      </p>
      {orderNumber && (
        <p className="mt-1 text-sm text-slate-500">Order: {orderNumber}</p>
      )}
      <div className="mt-6 flex justify-center gap-3">
        {orderNumber && (
          <Link
            to={`/account/orders/${orderNumber}`}
            className="rounded-lg bg-blue-600 px-5 py-2 text-white"
          >
            View Order
          </Link>
        )}
        <Link to="/shop" className="rounded-lg border px-5 py-2 dark:border-slate-700">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
