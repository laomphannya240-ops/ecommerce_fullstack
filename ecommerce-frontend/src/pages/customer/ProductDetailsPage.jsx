import { useEffect, useState } from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import api from '../../api/axios';
import ProductCard from '../../components/products/ProductCard';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { toast } from 'sonner';
import FieldError from '../../components/forms/FieldError';
import { clearFieldError, getErrorMessage, getFieldErrors } from '../../utils/validation';

export default function ProductDetailsPage() {
  const { slug } = useParams();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [review, setReview] = useState({ rating: 5, title: '', comment: '' });
  const [reviewErrors, setReviewErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();

  const load = async () => {
    setLoading(true);

    try {
      const { data } = await api.get(`/products/${slug}`);
      setDetail(data.data);
      setWishlisted(Boolean(data.data.is_wishlisted));
    } catch {
      setDetail(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const addToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add to cart');
      return;
    }

    try {
      await addItem(detail.product.id, qty);
      toast.success('Added to cart');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  const toggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to use your wishlist');
      return;
    }

    try {
      if (wishlisted) {
        const { data } = await api.get('/wishlist');
        const item = (data.data || []).find((entry) => entry.product_id === detail.product.id);
        if (item) await api.delete(`/wishlist/items/${item.id}`);
        setWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        await api.post('/wishlist/items', { product_id: detail.product.id });
        setWishlisted(true);
        toast.success('Added to wishlist');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Wishlist update failed');
    }
  };

  const submitReview = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please login to write a review');
      return;
    }

    setSubmitting(true);
    setReviewErrors({});

    try {
      await api.post(`/products/${detail.product.slug}/reviews`, review);
      toast.success('Review submitted');
      setReview({ rating: 5, title: '', comment: '' });
      await load();
    } catch (err) {
      setReviewErrors(getFieldErrors(err));
      toast.error(getErrorMessage(err, 'Review could not be submitted'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="mx-auto max-w-7xl px-4 py-10">Loading...</div>;
  if (!detail?.product) return <div className="mx-auto max-w-7xl px-4 py-10">Product not found.</div>;

  const { product, related = [], reviews = [], review_summary: summary } = detail;
  const image =
    product.thumbnail_url ||
    product.images?.[0]?.image_url ||
    'https://placehold.co/600x600/png?text=Product';
  const price = product.sale_price ?? product.price;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <img
            src={image}
            alt={product.name}
            className="w-full rounded-xl border border-slate-200 object-cover dark:border-slate-800"
          />
          {product.images?.length > 0 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {product.images.map((item) => (
                <img
                  key={item.id}
                  src={item.image_url}
                  alt={item.alt_text || product.name}
                  className="h-20 w-full rounded-md border object-cover dark:border-slate-700"
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-sm text-slate-500">
            {product.category?.name}
            {product.brand ? ` • ${product.brand.name}` : ''}
          </p>
          <h1 className="mt-1 text-3xl font-bold">{product.name}</h1>
          <div className="mt-2 flex items-center gap-2 text-sm text-amber-500">
            <span>{'★'.repeat(Math.round(summary?.average || 0))}</span>
            <span className="text-slate-500">
              {summary?.average || 0} ({summary?.count || 0} reviews)
            </span>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <span className="text-3xl font-bold text-blue-600">${Number(price).toFixed(2)}</span>
            {product.sale_price && (
              <span className="text-lg text-slate-400 line-through">
                ${Number(product.price).toFixed(2)}
              </span>
            )}
            {product.discount_percent > 0 && (
              <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                -{product.discount_percent}%
              </span>
            )}
          </div>

          <p className="mt-2 text-sm">SKU: {product.sku}</p>
          <p
            className={`mt-1 text-sm ${
              product.stock_quantity > 0 ? 'text-green-600' : 'text-red-500'
            }`}
          >
            {product.stock_quantity > 0
              ? `${product.stock_quantity} in stock`
              : 'Out of stock'}
          </p>
          <p className="mt-4 text-slate-700 dark:text-slate-300">
            {product.short_description || product.description || 'No description available.'}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <input
              type="number"
              min="1"
              max={product.stock_quantity || 1}
              value={qty}
              onChange={(event) =>
                setQty(Math.min(product.stock_quantity || 1, Math.max(1, Number(event.target.value))))
              }
              className="w-24 rounded-md border px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            />
            <button
              type="button"
              onClick={addToCart}
              disabled={product.stock_quantity <= 0}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <ShoppingCart size={18} /> Add to Cart
            </button>
            <button
              type="button"
              onClick={toggleWishlist}
              className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 font-semibold dark:border-slate-700 ${
                wishlisted ? 'border-red-300 text-red-600' : ''
              }`}
            >
              <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
              {wishlisted ? 'Wishlisted' : 'Wishlist'}
            </button>
          </div>

          {product.description && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold">Description</h2>
              <p className="mt-2 whitespace-pre-line text-slate-700 dark:text-slate-300">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">Customer Reviews</h2>
        <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-3">
            {reviews.length === 0 && <p className="text-slate-500">No reviews yet.</p>}
            {reviews.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-slate-200 p-4 dark:border-slate-800"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{item.user?.name || 'Customer'}</span>
                  <span className="text-amber-500">
                    {'★'.repeat(item.rating)}
                    {'☆'.repeat(5 - item.rating)}
                  </span>
                </div>
                {item.title && <p className="mt-1 font-medium">{item.title}</p>}
                {item.comment && (
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{item.comment}</p>
                )}
              </div>
            ))}
          </div>

          <form
            onSubmit={submitReview}
            className="h-fit space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <h3 className="font-semibold">Write a review</h3>
            <select
              value={review.rating}
              onChange={(event) => {
                setReview({ ...review, rating: Number(event.target.value) });
                setReviewErrors((previous) => clearFieldError(previous, 'rating'));
              }}
              className="w-full rounded border px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
            >
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value} star{value > 1 ? 's' : ''}
                </option>
              ))}
            </select>
            <FieldError errors={reviewErrors} name="rating" />
            <input
              placeholder="Review title (optional)"
              value={review.title}
              onChange={(event) => {
                setReview({ ...review, title: event.target.value });
                setReviewErrors((previous) => clearFieldError(previous, 'title'));
              }}
              className="w-full rounded border px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
            />
            <FieldError errors={reviewErrors} name="title" />
            <textarea
              rows={4}
              placeholder="Share your experience"
              value={review.comment}
              onChange={(event) => {
                setReview({ ...review, comment: event.target.value });
                setReviewErrors((previous) => clearFieldError(previous, 'comment'));
              }}
              className="w-full rounded border px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
            />
            <FieldError errors={reviewErrors} name="comment" />
            <button
              disabled={submitting}
              className="w-full rounded-lg bg-blue-600 py-2 font-semibold text-white disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-semibold">You may also like</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}

      <div className="mt-8">
        <Link to="/shop" className="text-blue-600 hover:underline">
          ← Back to shop
        </Link>
      </div>
    </div>
  );
}
