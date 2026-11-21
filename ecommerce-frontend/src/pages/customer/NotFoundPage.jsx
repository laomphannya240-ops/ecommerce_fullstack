import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="text-6xl font-bold text-violet-600">404</h1>
      <p className="mt-4 text-xl font-semibold">Page Not Found</p>
      <p className="mt-2 text-slate-500">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="mt-6 inline-block rounded-lg bg-violet-600 px-5 py-2 text-white">Go Home</Link>
    </div>
  );
}
