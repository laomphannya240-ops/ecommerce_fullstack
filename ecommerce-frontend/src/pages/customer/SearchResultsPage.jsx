import { useSearchParams } from 'react-router-dom';
import ShopPage from './ShopPage';

// Reuse shop with query param handled in ShopPage
export default function SearchResultsPage() {
  const [params] = useSearchParams();
  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 pt-8">
        <p className="text-slate-500">Search results for: <span className="font-semibold text-slate-900 dark:text-slate-100">{params.get('q') || ''}</span></p>
      </div>
      <ShopPage />
    </div>
  );
}
