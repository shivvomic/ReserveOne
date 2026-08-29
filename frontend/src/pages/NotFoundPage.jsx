import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-center">
      <h1 className="text-3xl font-bold text-slate-900">404 — Page not found</h1>
      <p className="text-slate-600">The page you're looking for doesn't exist.</p>
      <Link to="/" className="mt-2 text-indigo-600 hover:underline">
        Back to home
      </Link>
    </div>
  );
}

export default NotFoundPage;