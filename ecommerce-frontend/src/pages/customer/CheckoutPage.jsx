import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useCart } from '../../context/CartContext';
import { toast } from 'sonner';
import FieldError from '../../components/forms/FieldError';
import { clearFieldError, getErrorMessage, getFieldErrors } from '../../utils/validation';

const blankAddress = {
  label: 'Home',
  recipient_name: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postal_code: '',
  country: 'Cambodia',
  is_default: false,
};

export default function CheckoutPage() {
  const { cart, fetchCart } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [addressId, setAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState(blankAddress);
  const [addressErrors, setAddressErrors] = useState({});
  const [couponErrors, setCouponErrors] = useState({});
  const [orderErrors, setOrderErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get('/addresses')
      .then((response) => {
        const list = response.data.data || [];
        setAddresses(list);
        const preferred = list.find((address) => address.is_default) || list[0];
        if (preferred) setAddressId(String(preferred.id));
        else setShowNewAddress(true);
      })
      .catch(() => toast.error('Unable to load your addresses'));
  }, []);

  const selectedAddress = useMemo(
    () => addresses.find((address) => String(address.id) === String(addressId)),
    [addresses, addressId],
  );

  const subtotal = Number(cart?.subtotal || 0);
  const shippingFee = Number(cart?.shipping_fee || 0);
  const total = Math.max(0, subtotal - discount) + shippingFee;

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;

    setCouponErrors({});

    try {
      const { data } = await api.post('/coupons/apply', {
        code: couponCode.trim(),
        subtotal,
      });
      setDiscount(Number(data.data.discount || 0));
      toast.success(`Coupon applied: -$${Number(data.data.discount || 0).toFixed(2)}`);
    } catch (err) {
      setDiscount(0);
      setCouponErrors(getFieldErrors(err));
      toast.error(getErrorMessage(err, 'Invalid coupon'));
    }
  };

  const createAddress = async (event) => {
    event.preventDefault();
    setAddressErrors({});

    try {
      const { data } = await api.post('/addresses', newAddress);
      const address = data.data;
      setAddresses((previous) => [...previous, address]);
      setAddressId(String(address.id));
      setShowNewAddress(false);
      setNewAddress(blankAddress);
      toast.success('Address saved');
    } catch (err) {
      setAddressErrors(getFieldErrors(err));
      toast.error(getErrorMessage(err, 'Failed to save address'));
    }
  };

  const placeOrder = async () => {
    if (!selectedAddress) return toast.error('Please select or add a shipping address');
    if (!cart?.items?.length) return toast.error('Your cart is empty');

    setOrderErrors({});
    setLoading(true);

    try {
      const { data } = await api.post('/orders', {
        address_id: selectedAddress.id,
        shipping_name: selectedAddress.recipient_name,
        shipping_phone: selectedAddress.phone,
        shipping_line1: selectedAddress.line1,
        shipping_line2: selectedAddress.line2 || null,
        shipping_city: selectedAddress.city,
        shipping_state: selectedAddress.state || null,
        shipping_postal_code: selectedAddress.postal_code || null,
        shipping_country: selectedAddress.country || 'Cambodia',
        payment_method: paymentMethod,
        coupon_code: couponCode || null,
        notes: notes || null,
      });

      const order = data.data;
      await fetchCart();

      if (paymentMethod === 'khqr' && order.payment?.id) {
        navigate(`/payment/${order.payment.id}`);
      } else {
        navigate(`/payment/success?order=${order.order_number}`);
      }
    } catch (err) {
      setOrderErrors(getFieldErrors(err));
      toast.error(getErrorMessage(err, 'Checkout failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Checkout</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Shipping Address</h2>
              <button
                type="button"
                onClick={() => setShowNewAddress((value) => !value)}
                className="text-sm text-violet-600 hover:underline"
              >
                {showNewAddress ? 'Cancel' : 'Add New'}
              </button>
            </div>

            {showNewAddress ? (
              <form onSubmit={createAddress} className="grid gap-3 sm:grid-cols-2">
                {[
                  ['recipient_name', 'Recipient name', true],
                  ['phone', 'Phone', true],
                  ['line1', 'Address line 1', true],
                  ['line2', 'Address line 2', false],
                  ['city', 'City', true],
                  ['state', 'State / Province', false],
                  ['postal_code', 'Postal code', false],
                  ['country', 'Country', true],
                ].map(([field, placeholder, required]) => (
                  <div
                    key={field}
                    className={field === 'line1' || field === 'line2' ? 'sm:col-span-2' : ''}
                  >
                    <input
                      required={required}
                      placeholder={placeholder}
                      value={newAddress[field]}
                      onChange={(event) => {
                        setNewAddress({ ...newAddress, [field]: event.target.value });
                        setAddressErrors((previous) => clearFieldError(previous, field));
                      }}
                      className="w-full rounded border px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
                    />
                    <FieldError errors={addressErrors} name={field} />
                  </div>
                ))}
                <button
                  type="submit"
                  className="rounded bg-violet-600 px-4 py-2 text-white sm:col-span-2"
                >
                  Save Address
                </button>
              </form>
            ) : (
              <div className="space-y-2">
                {addresses.length === 0 && (
                  <p className="text-sm text-slate-500">
                    No addresses saved. Add one to continue.
                  </p>
                )}
                {addresses.map((address) => (
                  <label
                    key={address.id}
                    className={`flex cursor-pointer gap-3 rounded-lg border p-3 ${
                      String(addressId) === String(address.id)
                        ? 'border-violet-600 bg-violet-50 dark:bg-violet-950/30'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={String(addressId) === String(address.id)}
                      onChange={() => setAddressId(String(address.id))}
                    />
                    <div className="text-sm">
                      <p className="font-medium">
                        {address.recipient_name} • {address.phone}
                      </p>
                      <p className="text-slate-600 dark:text-slate-400">
                        {address.line1}
                        {address.line2 ? `, ${address.line2}` : ''}, {address.city}
                        {address.state ? `, ${address.state}` : ''}, {address.country}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-3 text-lg font-semibold">Payment Method</h2>
            <div className="space-y-2">
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 ${
                  paymentMethod === 'cod'
                    ? 'border-violet-600 bg-violet-50 dark:bg-violet-950/30'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="payment-method"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                />
                <span>Cash on Delivery (COD)</span>
              </label>
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 ${
                  paymentMethod === 'khqr'
                    ? 'border-violet-600 bg-violet-50 dark:bg-violet-950/30'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="payment-method"
                  checked={paymentMethod === 'khqr'}
                  onChange={() => setPaymentMethod('khqr')}
                />
                <span>KHQR / Bakong (demo)</span>
              </label>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-3 text-lg font-semibold">Order Notes</h2>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              className="w-full rounded border px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
              placeholder="Notes for delivery (optional)"
            />
          </section>
        </div>

        <aside className="h-fit rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold">Order Summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            {(cart?.items || []).map((item) => (
              <div key={item.id} className="flex justify-between gap-2">
                <span className="truncate">
                  {item.product?.name} × {item.quantity}
                </span>
                <span>${Number(item.total_price).toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between border-t pt-2 dark:border-slate-700">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount</span>
              <span className="text-green-600">-${discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shippingFee === 0 ? 'Free' : `$${shippingFee.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between border-t pt-2 text-base font-bold dark:border-slate-700">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <input
              value={couponCode}
              onChange={(event) => {
                setCouponCode(event.target.value.toUpperCase());
                setCouponErrors({});
                setOrderErrors((previous) => clearFieldError(previous, 'coupon_code'));
              }}
              placeholder="Coupon code"
              className="flex-1 rounded border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
            <button
              type="button"
              onClick={applyCoupon}
              className="rounded border px-3 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Apply
            </button>
          </div>
          <FieldError errors={couponErrors} name="code" />
          <FieldError errors={orderErrors} name="coupon_code" />
          {Object.entries(orderErrors)
            .filter(([field]) => field !== 'coupon_code')
            .map(([field, messages]) => (
              <p key={field} className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">
                {messages[0]}
              </p>
            ))}
          <button
            type="button"
            onClick={placeOrder}
            disabled={loading}
            className="mt-5 w-full rounded-lg bg-violet-600 py-3 font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {loading ? 'Placing Order...' : 'Confirm Order'}
          </button>
        </aside>
      </div>
    </div>
  );
}
