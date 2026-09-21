import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <h1 className="text-6xl font-display font-bold text-brand-cyan mb-4">404</h1>
      <h2 className="text-2xl font-bold text-main mb-2">Page Not Found</h2>
      <p className="text-muted text-sm max-w-md mb-8">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="bg-brand-cyan text-brand-dark px-6 py-3 rounded-full font-bold hover:bg-white transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
}
