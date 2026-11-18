import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import { toast } from 'sonner';

export default function OrderDetailsPage() {
  const { id: orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const { data } = await api.get(`/orders/${orderNumber}`);
      setOrder(data.data);
    } catch {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderNumber]);

  const cancel = async () => {
    if (!confirm('Cancel this order?')) return;

    try {
      await api.post(`/orders/${orderNumber}/cancel`);
      toast.success('Order cancelled');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  if (loading) return <div className="mx-auto max-w-5xl px-4 py-10">Loading...</div>;
  if (!order) return <div className="mx-auto max-w-5xl px-4 py-10">Order not found.</div>;

  const shipping = order.shipping || {};

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Order {order.order_number}</h1>
          <p className="text-sm text-slate-500">
            Placed on {new Date(order.placed_at || order.created_at).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          {order.payment?.payment_method === 'khqr' && order.payment?.status === 'pending' && (
            <button
              type="button"
              onClick={() => navigate(`/payment/${order.payment.id}`)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white"
            >
              Pay Now
            </button>
          )}
          {order.can_cancel && (
            <button
              type="button"
              onClick={cancel}
              className="rounded-lg border border-red-300 px-4 py-2 text-red-600 dark:border-red-800"
            >
              Cancel Order
            </button>
          )}
          <Link
            to="/account/orders"
            className="rounded-lg border px-4 py-2 dark:border-slate-700"
          >
            Back
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-4 md:col-span-2">
          <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-3 font-semibold">Items</h2>
            <div className="space-y-3">
              {(order.items || []).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0 dark:border-slate-800"
                >
                  <div>
                    <p className="font-medium">{item.product_name}</p>
                    <p className="text-sm text-slate-500">
                      Qty: {item.quantity} × ${Number(item.unit_price).toFixed(2)}
                    </p>
                  </div>
                  <p className="font-semibold">${Number(item.total_price).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </section>

          {order.notes && (
            <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-2 font-semibold">Order Notes</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">{order.notes}</p>
            </section>
          )}
        </div>

        <div className="space-y-4">
          <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-3 font-semibold">Summary</h2>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Status</span>
                <span className="capitalize">{order.status}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment</span>
                <span className="capitalize">{order.payment_status}</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${Number(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount</span>
                <span>-${Number(order.discount_amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>${Number(order.shipping_fee).toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-bold dark:border-slate-700">
                <span>Total</span>
                <span>${Number(order.total).toFixed(2)}</span>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-3 font-semibold">Shipping Address</h2>
            <p className="text-sm">{shipping.name}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">{shipping.phone}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {shipping.line1}
              {shipping.line2 ? `, ${shipping.line2}` : ''}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {shipping.city}
              {shipping.state ? `, ${shipping.state}` : ''} {shipping.postal_code}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">{shipping.country}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
