import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { toast } from 'sonner';
import { getErrorMessage, getFieldErrors } from '../../utils/validation';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [rowErrors, setRowErrors] = useState({});

  const load = async () => {
    try {
      const { data } = await api.get('/admin/customers', { params: { per_page: 50 } });
      setCustomers(data.data?.data || data.data || []);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load customers'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const view = async (id) => {
    try {
      const { data } = await api.get(`/admin/customers/${id}`);
      setSelected(data.data);
    } catch {
      toast.error('Failed to load customer');
    }
  };

  const toggleActive = async (customer) => {
    setRowErrors((previous) => {
      if (!previous[customer.id]) return previous;

      const next = { ...previous };
      delete next[customer.id];

      return next;
    });

    try {
      await api.put(`/admin/customers/${customer.id}`, { is_active: !customer.is_active });
      toast.success('Customer updated');
      load();
      if (selected?.customer?.id === customer.id) view(customer.id);
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      const message = fieldErrors.is_active?.[0] || getErrorMessage(err, 'Update failed');

      setRowErrors((previous) => ({ ...previous, [customer.id]: message }));
      toast.error(message);
    }
  };

  const detail = selected?.customer;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Customers</h2>
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left dark:bg-slate-900">
              <tr>
                <th className="p-3">Name</th>
                <th>Email</th>
                <th>Orders</th>
                <th>Spent</th>
                <th>Status</th>
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
                customers.map((customer) => (
                  <tr key={customer.id} className="border-t dark:border-slate-800">
                    <td className="p-3">{customer.name}</td>
                    <td>{customer.email}</td>
                    <td>{customer.orders_count ?? 0}</td>
                    <td>${Number(customer.total_spent || 0).toFixed(2)}</td>
                    <td>{customer.is_active ? 'Active' : 'Inactive'}</td>
                    <td className="py-2">
                      <div className="space-x-2">
                        <button onClick={() => view(customer.id)} className="text-blue-600">
                          View
                        </button>
                        <button
                          onClick={() => toggleActive(customer)}
                          className="text-amber-600"
                        >
                          {customer.is_active ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                      {rowErrors[customer.id] && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
                          {rowErrors[customer.id]}
                        </p>
                      )}
                    </td>
                  </tr>
                ))
              )}
              {!loading && customers.length === 0 && (
                <tr>
                  <td className="p-3 text-slate-500" colSpan="6">
                    No customers.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
          <h3 className="mb-3 font-semibold">Customer Details</h3>
          {!detail ? (
            <p className="text-sm text-slate-500">Select a customer.</p>
          ) : (
            <div className="space-y-2 text-sm">
              <p>
                <strong>{detail.name}</strong>
              </p>
              <p>{detail.email}</p>
              <p>{detail.phone || 'No phone'}</p>
              <p>Status: {detail.is_active ? 'Active' : 'Inactive'}</p>
              <p>
                Orders: {detail.orders_count ?? selected.orders?.length ?? 0} · Spent: $
                {Number(detail.total_spent || 0).toFixed(2)}
              </p>
              <div className="pt-2">
                <p className="font-medium">Recent Orders</p>
                {(selected.orders || []).slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex justify-between border-b py-1 dark:border-slate-800"
                  >
                    <span>{order.order_number}</span>
                    <span>${Number(order.total).toFixed(2)}</span>
                  </div>
                ))}
                {(selected.orders || []).length === 0 && (
                  <p className="text-slate-500">No orders yet.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
