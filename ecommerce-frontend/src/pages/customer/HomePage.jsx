import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import ProductCard from '../../components/products/ProductCard';
import { useLanguage } from '../../context/LanguageContext';

function ProductSection({ title, products, link, loading, emptyText }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
        <Link to={link} className="text-violet-600 hover:underline">
          View all
        </Link>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="h-72 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          {products.length === 0 && <p className="text-slate-500">{emptyText}</p>}
        </div>
      )}
    </section>
  );
}

export default function HomePage() {
  const [storefront, setStorefront] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    api
      .get('/home')
      .then((response) => setStorefront(response.data.data))
      .catch(() => setStorefront(null))
      .finally(() => setLoading(false));
  }, []);

  const banners = storefront?.banners || [];
  const categories = storefront?.categories || [];
  const featured = storefront?.featured_products || [];
  const newArrivals = storefront?.new_arrivals || [];
  const bestSellers = storefront?.best_sellers || [];
  const hero = banners.find((banner) => banner.position === 'home_hero') || banners[0];

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-r from-violet-600 to-purple-700 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <p className="mb-2 inline-block rounded-full bg-white/20 px-3 py-1 text-sm">
              {hero?.subtitle ? 'Featured collection' : 'New collection 2026'}
            </p>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">
              {hero?.title || t('heroTitle')}
            </h1>
            <p className="mt-4 max-w-xl text-violet-100">
              {hero?.subtitle || t('heroSubtitle')}
            </p>
            <div className="mt-6 flex gap-3">
              <Link
                to="/shop"
                className="rounded-lg bg-white px-5 py-3 font-semibold text-violet-700 hover:bg-violet-50"
              >
                {t('shopNow')}
              </Link>
              <Link
                to="/categories"
                className="rounded-lg border border-white/40 px-5 py-3 font-semibold hover:bg-white/10"
              >
                {t('categories')}
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            {hero?.image_url ? (
              <img
                src={hero.image_url}
                alt={hero.title}
                className="max-h-[420px] w-full rounded-2xl object-cover shadow-2xl"
              />
            ) : (
              <div className="rounded-2xl bg-white/10 p-10 text-center">
                <div className="text-6xl">🛍️</div>
                <p className="mt-4 text-lg">Premium shopping experience</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">{t('categories')}</h2>
          <Link to="/categories" className="text-violet-600 hover:underline">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {categories.slice(0, 8).map((category) => (
            <Link
              key={category.id}
              to={`/shop?category=${category.slug}`}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white text-center shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              {category.image_url ? (
                <img
                  src={category.image_url}
                  alt={category.name}
                  className="h-28 w-full object-cover"
                />
              ) : (
                <div className="flex h-28 items-center justify-center bg-violet-50 text-4xl dark:bg-slate-800">
                  🛒
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold">{category.name}</h3>
                <p className="text-xs text-slate-500">
                  {category.products_count ?? 0} products
                </p>
              </div>
            </Link>
          ))}
          {!loading && categories.length === 0 && (
            <p className="text-slate-500">No categories yet.</p>
          )}
        </div>
      </section>

      <ProductSection
        title={t('featuredProducts')}
        products={featured}
        link="/shop?featured=1"
        loading={loading}
        emptyText="No featured products."
      />

      <div className="bg-white dark:bg-slate-900">
        <ProductSection
          title={t('newArrivals')}
          products={newArrivals}
          link="/shop?sort=latest"
          loading={loading}
          emptyText="No products yet."
        />
      </div>

      <ProductSection
        title={t('bestSellers')}
        products={bestSellers}
        link="/shop?sort=popular"
        loading={loading}
        emptyText="No sales data yet."
      />

      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="rounded-2xl bg-slate-900 px-6 py-10 text-center text-white dark:bg-violet-950">
          <h2 className="text-2xl font-bold">Subscribe to our newsletter</h2>
          <p className="mt-2 text-slate-300">Get updates on new arrivals and special offers.</p>
          <form
            className="mx-auto mt-6 flex max-w-md flex-col gap-2 sm:flex-row"
            onSubmit={(event) => event.preventDefault()}
          >
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 rounded-lg px-4 py-2 text-slate-900"
            />
            <button className="rounded-lg bg-violet-600 px-5 py-2 font-semibold hover:bg-violet-700">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
