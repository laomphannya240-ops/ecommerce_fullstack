import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import { toast } from 'sonner';

export default function PaymentPage() {
  const { id } = useParams();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    try {
      const { data } = await api.get(`/payments/${id}`);
      setPayment(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to load payment');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const verify = async () => {
    setVerifying(true);

    try {
      const { data } = await api.post(`/payments/${id}/verify`);
      const updated = data.data;
      setPayment(updated);
      toast.success('Payment verified');
      navigate(
        `/payment/success?order=${
          updated.order?.order_number || payment.order?.order_number || updated.order_id
        }`,
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return <div className="mx-auto max-w-3xl px-4 py-10">Loading payment...</div>;
  }

  if (!payment) {
    return <div className="mx-auto max-w-3xl px-4 py-10">Payment not found.</div>;
  }

  const orderNumber = payment.order?.order_number || `#${payment.order_id}`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Payment</h1>
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm text-slate-500">Order {orderNumber}</p>
            <p className="mt-1 text-2xl font-bold">
              ${Number(payment.amount).toFixed(2)} {payment.currency}
            </p>
            <p className="mt-2 text-sm">
              Method:{' '}
              <span className="font-medium uppercase">{payment.payment_method}</span>
            </p>
            <p className="mt-1 text-sm">
              Status: <span className="font-medium capitalize">{payment.status}</span>
            </p>
            {payment.status === 'pending' && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                This is a demo KHQR flow: no money is transferred. Use the button below to
                simulate the provider confirming the payment.
              </div>
            )}
          </div>
          <div className="flex flex-col items-center justify-center">
            {payment.qr_payload ? (
              <div className="w-full rounded-lg border border-dashed p-4 text-center dark:border-slate-700">
                <div className="mx-auto mb-3 flex h-48 w-48 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-500 dark:bg-slate-800">
                  KHQR
                </div>
                <p className="break-all text-xs text-slate-500">{payment.qr_payload}</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Scan with your Bakong/KHQR app to pay.
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-slate-500 dark:border-slate-700">
                A QR code is only generated for KHQR payments.
              </div>
            )}
          </div>
        </div>

        {payment.payment_method === 'khqr' && payment.status === 'pending' && (
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={verify}
              disabled={verifying}
              className="rounded-lg bg-green-600 px-5 py-2 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
            >
              {verifying ? 'Verifying...' : 'Simulate Payment Verification'}
            </button>
            <button
              onClick={load}
              className="rounded-lg border px-5 py-2 font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Refresh
            </button>
          </div>
        )}

        {payment.status === 'paid' && (
          <div className="mt-6">
            <button
              onClick={() => navigate(`/payment/success?order=${orderNumber}`)}
              className="rounded-lg bg-green-600 px-5 py-2 font-semibold text-white hover:bg-green-700"
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
