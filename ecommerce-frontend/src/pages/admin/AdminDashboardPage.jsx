import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api
      .get('/admin/dashboard')
      .then((response) => setData(response.data.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (error || !data) return <div>Failed to load dashboard.</div>;

  const {
    stats = {},
    sales_chart = [],
    status_breakdown = {},
    recent_orders = [],
    top_products = [],
    low_stock_products = [],
  } = data;

  const cards = [
    {
      label: 'Total Revenue',
      value: `$${Number(stats.total_revenue || 0).toFixed(2)}`,
      hint: `$${Number(stats.revenue_today || 0).toFixed(2)} today`,
    },
    {
      label: 'Orders',
      value: stats.orders_count ?? 0,
      hint: `${stats.orders_today ?? 0} today · ${stats.pending_orders ?? 0} open`,
    },
    {
      label: 'Customers',
      value: stats.customers_count ?? 0,
      hint: 'Registered customers',
    },
    {
      label: 'Products',
      value: stats.products_count ?? 0,
      hint: `${stats.low_stock_count ?? 0} low stock`,
    },
  ];

  const maxRevenue = Math.max(1, ...sales_chart.map((day) => Number(day.revenue || 0)));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950"
          >
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-bold">{card.value}</p>
            <p className="mt-1 text-xs text-slate-500">{card.hint}</p>
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <h3 className="mb-4 font-semibold">Revenue · Last 7 Days</h3>
        <div className="flex h-40 items-end gap-3">
          {sales_chart.map((day) => (
            <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full flex-1 items-end">
                <div
                  className="w-full rounded-t bg-violet-500/80"
                  style={{ height: `${Math.max(4, (Number(day.revenue) / maxRevenue) * 100)}%` }}
                  title={`$${Number(day.revenue).toFixed(2)} · ${day.orders} orders`}
                />
              </div>
              <span className="text-[10px] text-slate-500">{day.date.slice(5)}</span>
            </div>
          ))}
          {sales_chart.length === 0 && (
            <p className="text-sm text-slate-500">No sales data yet.</p>
          )}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <h3 className="mb-3 font-semibold">Orders by Status</h3>
          <div className="space-y-2">
            {Object.keys(status_breakdown).length === 0 && (
              <p className="text-sm text-slate-500">No data.</p>
            )}
            {Object.entries(status_breakdown).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between text-sm">
                <span className="capitalize">{status}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <h3 className="mb-3 font-semibold">Low Stock Products</h3>
          <div className="space-y-2">
            {low_stock_products.length === 0 && (
              <p className="text-sm text-slate-500">No low stock products.</p>
            )}
            {low_stock_products.map((product) => (
              <div key={product.id} className="flex items-center justify-between text-sm">
                <span className="truncate pr-2">{product.name}</span>
                <span className="font-semibold text-red-600">{product.stock_quantity}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <h3 className="mb-3 font-semibold">Recent Orders</h3>
          <table className="w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr>
                <th className="py-2">Order</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {recent_orders.map((order) => (
                <tr key={order.id} className="border-t dark:border-slate-800">
                  <td className="py-2">{order.order_number}</td>
                  <td>{order.customer?.name || '-'}</td>
                  <td className="capitalize">{order.status}</td>
                  <td>${Number(order.total).toFixed(2)}</td>
                </tr>
              ))}
              {recent_orders.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-3 text-slate-500">
                    No orders.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <h3 className="mb-3 font-semibold">Top Products</h3>
          <div className="space-y-2">
            {top_products.length === 0 && (
              <p className="text-sm text-slate-500">No sales data yet.</p>
            )}
            {top_products.map((product) => (
              <div key={product.id} className="flex items-center justify-between text-sm">
                <span className="truncate pr-2">{product.name}</span>
                <span className="font-semibold">{product.orders_count || 0} sold</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
