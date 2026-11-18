import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function AdminReportsPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api
      .get('/admin/reports')
      .then((response) => setReport(response.data.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading reports...</div>;
  if (error || !report) return <div>Failed to load reports.</div>;

  const monthlyRevenue = report.monthly_revenue || [];
  const topCategories = report.top_categories || [];
  const paymentBreakdown = report.payment_breakdown || [];

  const totalRevenue = monthlyRevenue.reduce(
    (sum, month) => sum + Number(month.revenue || 0),
    0,
  );
  const totalOrders = monthlyRevenue.reduce((sum, month) => sum + Number(month.orders || 0), 0);
  const maxRevenue = Math.max(1, ...monthlyRevenue.map((month) => Number(month.revenue || 0)));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Sales Reports</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <p className="text-sm text-slate-500">Revenue · 6 Months</p>
          <p className="mt-2 text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <p className="text-sm text-slate-500">Orders · 6 Months</p>
          <p className="mt-2 text-2xl font-bold">{totalOrders}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <p className="text-sm text-slate-500">Average Order Value</p>
          <p className="mt-2 text-2xl font-bold">
            ${Number(report.average_order_value || 0).toFixed(2)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <p className="text-sm text-slate-500">Top Category</p>
          <p className="mt-2 text-2xl font-bold">{topCategories[0]?.name || '—'}</p>
        </div>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <h3 className="mb-4 font-semibold">Monthly Revenue</h3>
        <div className="flex h-40 items-end gap-3">
          {monthlyRevenue.map((month) => (
            <div key={month.month} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full flex-1 items-end">
                <div
                  className="w-full rounded-t bg-emerald-500/80"
                  style={{
                    height: `${Math.max(4, (Number(month.revenue) / maxRevenue) * 100)}%`,
                  }}
                  title={`$${Number(month.revenue).toFixed(2)} · ${month.orders} orders`}
                />
              </div>
              <span className="text-[10px] text-slate-500">{month.month}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <h3 className="mb-3 font-semibold">Top Categories</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-500">
                <tr>
                  <th className="py-2">Category</th>
                  <th>Units</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topCategories.map((category) => (
                  <tr key={category.name} className="border-t dark:border-slate-800">
                    <td className="py-2">{category.name}</td>
                    <td>{category.units}</td>
                    <td>${Number(category.revenue).toFixed(2)}</td>
                  </tr>
                ))}
                {topCategories.length === 0 && (
                  <tr>
                    <td colSpan="3" className="py-3 text-slate-500">
                      No data.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <h3 className="mb-3 font-semibold">Payment Methods</h3>
          <div className="space-y-2">
            {paymentBreakdown.map((payment) => (
              <div
                key={payment.payment_method}
                className="flex items-center justify-between text-sm"
              >
                <span className="uppercase">{payment.payment_method}</span>
                <span className="text-slate-500">
                  {payment.total} payments · ${Number(payment.amount || 0).toFixed(2)}
                </span>
              </div>
            ))}
            {paymentBreakdown.length === 0 && (
              <p className="text-sm text-slate-500">No payments recorded.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
