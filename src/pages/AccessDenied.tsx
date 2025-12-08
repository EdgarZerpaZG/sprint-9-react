import { Link } from "react-router-dom";

export default function AccessDenied() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4">
      <section className="w-full max-w-md bg-white/5 rounded-xl p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">Access denied</h1>
        <p className="text-sm opacity-80 mb-6">
          You don't have permission to view this page.
        </p>

        <div className="flex justify-center gap-3">
          <Link to="/" className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-sm">
            Go home
          </Link>
          <Link to="/login" className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-sm">
            Login
          </Link>
        </div>
      </section>
    </main>
  );
}