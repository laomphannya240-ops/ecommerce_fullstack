import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import ProductCard from '../../components/products/ProductCard';

const emptyFilters = {
  search: '',
  category: '',
  brand: '',
  sort: '',
  min_price: '',
  max_price: '',
  featured: '',
  in_stock: '',
  page: 1,
};

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState(() => ({
    ...emptyFilters,
    search: searchParams.get('q') || searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    sort: searchParams.get('sort') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    featured: searchParams.get('featured') || '',
    in_stock: searchParams.get('in_stock') || '',
    page: Number(searchParams.get('page') || 1),
  }));

  useEffect(() => {
    api
      .get('/categories')
      .then((response) => setCategories(response.data.data || []))
      .catch(() => {});
    api
      .get('/brands')
      .then((response) => setBrands(response.data.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);

      try {
        const params = { ...filters, per_page: 12 };
        Object.keys(params).forEach((key) => {
          if (params[key] === '' || params[key] == null) delete params[key];
        });

        const { data } = await api.get('/products', { params });
        if (cancelled) return;

        setProducts(data.data || []);
        setMeta(data.meta || null);

        const next = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value && key !== 'per_page') next.set(key, value);
        });
        setSearchParams(next, { replace: true });
      } catch {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.search,
    filters.category,
    filters.brand,
    filters.sort,
    filters.min_price,
    filters.max_price,
    filters.featured,
    filters.in_stock,
    filters.page,
  ]);

  const update = (key, value) =>
    setFilters((current) => ({
      ...current,
      [key]: value,
      page: key === 'page' ? value : 1,
    }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Shop</h1>
          {meta?.total != null && (
            <p className="text-sm text-slate-500">{meta.total} products</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setFilters(emptyFilters)}
          className="rounded-md border px-3 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          Clear filters
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit space-y-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div>
            <label className="mb-1 block text-sm font-medium">Search</label>
            <input
              value={filters.search}
              onChange={(event) => update('search', event.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              placeholder="Search..."
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Category</label>
            <select
              value={filters.category}
              onChange={(event) => update('category', event.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="">All</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Brand</label>
            <select
              value={filters.brand}
              onChange={(event) => update('brand', event.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="">All</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.slug}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Min $</label>
              <input
                type="number"
                min="0"
                value={filters.min_price}
                onChange={(event) => update('min_price', event.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Max $</label>
              <input
                type="number"
                min="0"
                value={filters.max_price}
                onChange={(event) => update('max_price', event.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Sort</label>
            <select
              value={filters.sort}
              onChange={(event) => update('sort', event.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="">Default</option>
              <option value="latest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name A-Z</option>
              <option value="popular">Most popular</option>
            </select>
          </div>
          <div className="space-y-2 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.featured === '1'}
                onChange={(event) => update('featured', event.target.checked ? '1' : '')}
              />
              Featured only
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.in_stock === '1'}
                onChange={(event) => update('in_stock', event.target.checked ? '1' : '')}
              />
              In stock only
            </label>
          </div>
        </aside>

        <section>
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="h-72 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800"
                />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {products.length === 0 && (
                <div className="rounded-xl border border-dashed p-10 text-center text-slate-500 dark:border-slate-700">
                  No products matched your filters.
                </div>
              )}
              {meta && meta.last_page > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    disabled={meta.current_page <= 1}
                    onClick={() => update('page', meta.current_page - 1)}
                    className="rounded border px-3 py-1 disabled:opacity-50 dark:border-slate-700"
                  >
                    Prev
                  </button>
                  <span className="text-sm">
                    Page {meta.current_page} of {meta.last_page}
                  </span>
                  <button
                    type="button"
                    disabled={meta.current_page >= meta.last_page}
                    onClick={() => update('page', meta.current_page + 1)}
                    className="rounded border px-3 py-1 disabled:opacity-50 dark:border-slate-700"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
