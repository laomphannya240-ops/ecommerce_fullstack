import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { toast } from 'sonner';
import { getErrorMessage, getFieldErrors } from '../../utils/validation';

const statuses = ['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [statusErrors, setStatusErrors] = useState({});

  const load = async () => {
    try {
      const { data } = await api.get('/admin/orders', { params: { per_page: 50 } });
      setOrders(data.data?.data || data.data || []);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load orders'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const view = async (orderNumber) => {
    try {
      const { data } = await api.get(`/admin/orders/${orderNumber}`);
      setSelected(data.data);
    } catch {
      toast.error('Failed to load order');
    }
  };

  const updateStatus = async (orderNumber, status) => {
    setStatusErrors((previous) => {
      if (!previous[orderNumber]) return previous;

      const next = { ...previous };
      delete next[orderNumber];

      return next;
    });

    try {
      await api.put(`/admin/orders/${orderNumber}/status`, { status });
      toast.success('Status updated');
      load();
      if (selected?.order_number === orderNumber) view(orderNumber);
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      const message = fieldErrors.status?.[0] || getErrorMessage(err, 'Update failed');

      setStatusErrors((previous) => ({ ...previous, [orderNumber]: message }));
      toast.error(message);
    }
  };

  const shipping = selected?.shipping || {};

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Orders</h2>
      <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left dark:bg-slate-900">
              <tr>
                <th className="p-3">Order</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="p-3" colSpan="6">
                    Loading...
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-t dark:border-slate-800">
                    <td className="p-3">{order.order_number}</td>
                    <td>{order.customer?.name || '-'}</td>
                    <td className="capitalize">{order.status}</td>
                    <td className="capitalize">{order.payment_status}</td>
                    <td>${Number(order.total).toFixed(2)}</td>
                    <td className="py-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => view(order.order_number)}
                          className="text-violet-600"
                        >
                          View
                        </button>
                        <select
                          value={order.status}
                          onChange={(event) =>
                            updateStatus(order.order_number, event.target.value)
                          }
                          className="rounded border px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-900"
                        >
                          {statuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>
                      {statusErrors[order.order_number] && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
                          {statusErrors[order.order_number]}
                        </p>
                      )}
                    </td>
                  </tr>
                ))
              )}
              {!loading && orders.length === 0 && (
                <tr>
                  <td className="p-3 text-slate-500" colSpan="6">
                    No orders.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
          <h3 className="mb-3 font-semibold">Order Details</h3>
          {!selected ? (
            <p className="text-sm text-slate-500">Select an order to view details.</p>
          ) : (
            <div className="space-y-3 text-sm">
              <p>
                <strong>{selected.order_number}</strong> •{' '}
                <span className="capitalize">{selected.status}</span>
              </p>
              <p>
                Customer: {selected.customer?.name || '-'} ({selected.customer?.email || '-'})
              </p>
              <p>
                Payment: {selected.payment?.payment_method || '-'} / {selected.payment_status}
              </p>
              <div>
                <p className="font-medium">Items</p>
                {(selected.items || []).map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between border-b py-1 dark:border-slate-800"
                  >
                    <span>
                      {item.product_name} × {item.quantity}
                    </span>
                    <span>${Number(item.total_price).toFixed(2)}</span>
                  </div>
                ))}
                {(selected.items || []).length === 0 && (
                  <p className="text-slate-500">No items.</p>
                )}
              </div>
              <div className="border-t pt-2 dark:border-slate-700">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${Number(selected.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount</span>
                  <span>-${Number(selected.discount_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>${Number(selected.shipping_fee).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${Number(selected.total).toFixed(2)}</span>
                </div>
              </div>
              <div>
                <p className="font-medium">Ship to</p>
                <p className="text-slate-600 dark:text-slate-400">
                  {shipping.name || '-'}, {shipping.phone || '-'}
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  {[shipping.line1, shipping.line2, shipping.city, shipping.state, shipping.country]
                    .filter(Boolean)
                    .join(', ') || '-'}
                </p>
                {selected.notes && (
                  <p className="mt-1 text-slate-600 dark:text-slate-400">
                    Notes: {selected.notes}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
