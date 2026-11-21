import { Link, useSearchParams } from 'react-router-dom';
import { XCircle } from 'lucide-react';

export default function PaymentFailedPage() {
  const [params] = useSearchParams();
  const orderNumber = params.get('order');

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <XCircle className="mx-auto text-red-500" size={64} />
      <h1 className="mt-4 text-3xl font-bold">Payment Failed</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        We couldn't complete your payment. Please try again or choose another method.
      </p>
      {orderNumber && (
        <p className="mt-1 text-sm text-slate-500">Order: {orderNumber}</p>
      )}
      <div className="mt-6 flex justify-center gap-3">
        {orderNumber && (
          <Link
            to={`/account/orders/${orderNumber}`}
            className="rounded-lg bg-violet-600 px-5 py-2 text-white"
          >
            View Order
          </Link>
        )}
        <Link to="/cart" className="rounded-lg border px-5 py-2 dark:border-slate-700">
          Back to Cart
        </Link>
      </div>
    </div>
  );
}
