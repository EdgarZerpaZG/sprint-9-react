import { useState } from "react";
import { Link } from "react-router-dom";
import { usePublicPages } from "../../features/content/hooks/usePublicPages";
import { useUserRole } from "../../hooks/useUserRole";

export default function PagesContent() {
  const [page, setPage] = useState(1);
  const { pages, totalPages, loading, error } = usePublicPages({
    page,
    pageSize: 10,
  });

  const { role } = useUserRole();
  const isEditorOrAdmin = role === "editor" || role === "admin";

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <p>Loading pages...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <p className="text-red-500">Error loading pages: {error}</p>
      </div>
    );
  }

  if (!pages.length) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold mb-4">Content</h1>
        <p className="text-slate-600">No pages found.</p>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <header>
        <h1 className="text-3xl font-bold mb-2">Content</h1>
        <p className="text-slate-600">
          Latest static pages of the animal shelter.
        </p>
      </header>

      <section className="space-y-4">
        {pages.map((p) => (
          <article
            key={p.id}
            className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm"
          >
            <header className="flex items-center justify-between gap-3 mb-2">
              <div>
                <Link
                  to={`/pages/${p.slug}`}
                  className="text-xl font-semibold text-emerald-800 hover:underline"
                >
                  {p.title}
                </Link>
                <p className="text-xs text-slate-400">/pages/{p.slug}</p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                {isEditorOrAdmin && (
                  <span
                    className={
                      p.status === "published"
                        ? "inline-flex px-2 py-1 rounded-full bg-emerald-100 text-emerald-700"
                        : "inline-flex px-2 py-1 rounded-full bg-yellow-100 text-yellow-700"
                    }
                  >
                    {p.status === "published" ? "Published" : "Draft"}
                  </span>
                )}

                <span className="text-slate-500">
                  {new Date(p.updated_at).toLocaleDateString()}
                </span>
              </div>
            </header>

            {p.excerpt && (
              <p className="text-sm text-slate-700 mb-2">{p.excerpt}</p>
            )}

          </article>
        ))}
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <footer className="flex items-center justify-between mt-6 text-sm">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded border border-slate-300 disabled:opacity-50"
          >
            Previous
          </button>

          <span className="text-slate-600">
            Page {page} of {totalPages}
          </span>

          <button
            type="button"
            onClick={() =>
              setPage((prev) => (prev < totalPages ? prev + 1 : prev))
            }
            disabled={page >= totalPages}
            className="px-3 py-1 rounded border border-slate-300 disabled:opacity-50"
          >
            Next
          </button>
        </footer>
      )}
    </main>
  );
}