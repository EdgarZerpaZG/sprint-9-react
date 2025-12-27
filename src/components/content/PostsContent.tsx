import { useState } from "react";
import { Link } from "react-router-dom";
import { usePublicPosts } from "../../features/content/hooks/usePublicPosts";
import { useUserRole } from "../../hooks/useUserRole";

export default function PostsContent() {
  const [page, setPage] = useState(1);
  const { posts, totalPages, loading, error } = usePublicPosts({
    page,
    pageSize: 10,
  });

  const { role } = useUserRole();
  const isEditorOrAdmin = role === "editor" || role === "admin";

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-10">
        <p>Loading posts...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-10">
        <p className="text-red-500">Error loading posts: {error}</p>
      </main>
    );
  }

  if (!posts.length) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold mb-4">News</h1>
        <p className="text-slate-600">No posts found.</p>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <header>
        <h1 className="text-3xl font-bold mb-2">News</h1>
        <p className="text-slate-600">
          Updates and stories from the animal shelter.
        </p>
      </header>

      <section className="space-y-4">
        {posts.map((post) => (
          <article
            key={post.id}
            className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm"
          >
            <header className="flex items-center justify-between gap-3 mb-2">
              <div>
                <Link
                  to={`/posts/${post.slug}`}
                  className="text-xl font-semibold text-emerald-800 hover:underline"
                >
                  {post.title}
                </Link>
                {post.category && (
                  <p className="text-xs text-emerald-700 font-medium">
                    {post.category}
                  </p>
                )}
                <p className="text-[11px] text-slate-400">/posts/{post.slug}</p>
              </div>

              <div className="flex flex-col items-end gap-1 text-xs">
                {isEditorOrAdmin && (
                  <span
                    className={
                      post.status === "published"
                        ? "inline-flex px-2 py-1 rounded-full bg-emerald-100 text-emerald-700"
                        : "inline-flex px-2 py-1 rounded-full bg-yellow-100 text-yellow-700"
                    }
                  >
                    {post.status === "published" ? "Published" : "Draft"}
                  </span>
                )}

                <span className="text-slate-500">
                  {new Date(post.updated_at).toLocaleDateString()}
                </span>
              </div>
            </header>

            {post.excerpt && (
              <p className="text-sm text-slate-700 mb-2">{post.excerpt}</p>
            )}

          </article>
        ))}
      </section>

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