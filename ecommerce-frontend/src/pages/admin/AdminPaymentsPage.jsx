import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { toast } from 'sonner';
import { getErrorMessage, getFieldErrors } from '../../utils/validation';

const statuses = ['pending', 'paid', 'failed', 'cancelled', 'refunded'];

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusErrors, setStatusErrors] = useState({});

  const load = async () => {
    try {
      const { data } = await api.get('/admin/payments', { params: { per_page: 50 } });
      setPayments(data.data?.data || data.data || []);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load payments'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    setStatusErrors((previous) => {
      if (!previous[id]) return previous;

      const next = { ...previous };
      delete next[id];

      return next;
    });

    try {
      await api.put(`/admin/payments/${id}/status`, { status });
      toast.success('Payment status updated');
      load();
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      const message = fieldErrors.status?.[0] || getErrorMessage(err, 'Update failed');

      setStatusErrors((previous) => ({ ...previous, [id]: message }));
      toast.error(message);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Payments</h2>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left dark:bg-slate-900">
            <tr>
              <th className="p-3">ID</th>
              <th>Order</th>
              <th>Customer</th>
              <th>Method</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Transaction</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-3" colSpan="8">
                  Loading...
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment.id} className="border-t dark:border-slate-800">
                  <td className="p-3">{payment.id}</td>
                  <td>{payment.order?.order_number || `#${payment.order_id}`}</td>
                  <td>{payment.order?.customer?.name || '-'}</td>
                  <td className="uppercase">{payment.payment_method}</td>
                  <td className="capitalize">{payment.status}</td>
                  <td>${Number(payment.amount).toFixed(2)}</td>
                  <td className="text-xs">{payment.transaction_id || '-'}</td>
                  <td className="py-2">
                    <select
                      value={payment.status}
                      onChange={(event) => updateStatus(payment.id, event.target.value)}
                      className="rounded border px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-900"
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    {statusErrors[payment.id] && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
                        {statusErrors[payment.id]}
                      </p>
                    )}
                  </td>
                </tr>
              ))
            )}
            {!loading && payments.length === 0 && (
              <tr>
                <td className="p-3 text-slate-500" colSpan="8">
                  No payments.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
