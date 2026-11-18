import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const badgeClass = (status) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-indigo-100 text-indigo-700',
    delivered: 'bg-green-100 text-green-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    paid: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    refunded: 'bg-slate-100 text-slate-700',
  };
  return `inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
    classes[status] || 'bg-slate-100 text-slate-700'
  }`;
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get('/orders', { params: { page } })
      .then((response) => {
        setOrders(response.data.data || []);
        setMeta(response.data.meta || null);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Orders</h1>
        <Link to="/account" className="text-blue-600 hover:underline">
          Account
        </Link>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : orders.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center dark:border-slate-700">
          <p className="text-slate-500">You have no orders yet.</p>
          <Link
            to="/shop"
            className="mt-4 inline-block rounded-lg bg-blue-600 px-5 py-2 text-white"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                to={`/account/orders/${order.order_number}`}
                className="block rounded-xl border border-slate-200 bg-white p-4 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold">{order.order_number}</p>
                    <p className="text-sm text-slate-500">
                      {order.placed_at
                        ? new Date(order.placed_at).toLocaleString()
                        : new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={badgeClass(order.status)}>{order.status}</span>
                    <span className={badgeClass(order.payment_status)}>
                      {order.payment_status}
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span>{order.items_count ?? order.items?.length ?? 0} item(s)</span>
                  <span className="font-bold">${Number(order.total).toFixed(2)}</span>
                </div>
              </Link>
            ))}
          </div>

          {meta && meta.last_page > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((value) => value - 1)}
                className="rounded border px-3 py-1 disabled:opacity-50 dark:border-slate-700"
              >
                Prev
              </button>
              <span className="text-sm">
                Page {meta.current_page} of {meta.last_page}
              </span>
              <button
                type="button"
                disabled={page >= meta.last_page}
                onClick={() => setPage((value) => value + 1)}
                className="rounded border px-3 py-1 disabled:opacity-50 dark:border-slate-700"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
