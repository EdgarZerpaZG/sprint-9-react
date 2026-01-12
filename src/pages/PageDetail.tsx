import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import type { PageRow } from "../types/contentTypes";
import BlocksRenderer from "../components/content/BlocksRenderer";
import { useUserRole } from "../hooks/useUserRole";
import { resolvePublicPath } from "../utils/resolvePublicPath";

export default function PageDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { role, loadingRole } = useUserRole();

  const [page, setPage] = useState<PageRow | null>(null);
  const [children, setChildren] = useState<PageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canSeeDraft = role === "editor" || role === "admin";

  useEffect(() => {
    let alive = true;

    async function load() {
      if (!slug) {
        setError("Missing slug.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setChildren([]);

      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("slug", slug)
        .maybeSingle<PageRow>();

      if (!alive) return;

      if (error) {
        console.error("[PageDetail] error loading page:", error);
        setError("Could not load the page.");
        setPage(null);
        setLoading(false);
        return;
      }

      if (!data) {
        setError("Page not found.");
        setPage(null);
        setLoading(false);
        return;
      }

      setPage(data);

      if (data.type === "collection") {
        const { data: childData, error: childError } = await supabase
          .from("pages")
          .select("*")
          .eq("parent_collection_id", data.id)
          .eq("status", "published")
          .order("created_at", { ascending: false });

        if (!alive) return;

        if (childError) {
          console.error("[PageDetail] error loading children:", childError);
        } else {
          setChildren((childData ?? []) as PageRow[]);
        }
      }

      setLoading(false);
    }

    load();

    return () => {
      alive = false;
    };
  }, [slug]);

  if (loading || loadingRole) {
    return (
      <main className="max-w-3xl mx-auto py-10">
        <p>Loading...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-3xl mx-auto py-10">
        <p className="text-red-500">{error}</p>
      </main>
    );
  }

  if (!page) {
    return (
      <main className="max-w-3xl mx-auto py-10">
        <p>Page not found.</p>
      </main>
    );
  }

  const isDraft = page.status === "draft";

  if (isDraft && !canSeeDraft) {
    return (
      <main className="max-w-3xl mx-auto py-10">
        <p>This page is not published yet.</p>
      </main>
    );
  }

  const isCollection = page.type === "collection";
  const showTitle = page.show_title ?? true;

  return (
    <main className="max-w-3xl mx-auto py-10 space-y-6">
      <header className="space-y-2">
        {showTitle && (
          <h1 className="text-3xl font-bold">{page.title}</h1>
        )}

        {page.excerpt && (
          <p className="text-slate-500 text-sm">{page.excerpt}</p>
        )}

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span>
            {page.published_at
              ? `Published: ${new Date(
                  page.published_at
                ).toLocaleDateString()}`
              : `Created: ${new Date(
                  page.created_at
                ).toLocaleDateString()}`}
          </span>

          {isDraft && (
            <span className="inline-flex items-center rounded-full bg-yellow-500/10 px-2 py-0.5 text-[11px] font-medium text-yellow-500">
              Draft
            </span>
          )}
        </div>
      </header>

      <section className="prose prose-invert max-w-none">
        <BlocksRenderer blocks={page.blocks ?? []} />
      </section>

      {isCollection && (
        <section className="pt-6 border-t border-slate-700/40 mt-4 space-y-3">
          <h2 className="text-xl font-semibold">Items</h2>

          {children.length === 0 && (
            <p className="text-sm text-slate-400">
              There is no content in this collection yet.
            </p>
          )}

          {children.length > 0 && (
            <ul className="space-y-2">
              {children.map((child) => (
                <li
                  key={child.id}
                  className="border border-slate-800 rounded-md px-3 py-2 hover:border-emerald-400/70 transition-colors"
                >
                  <Link
                    to={resolvePublicPath(child)}
                    className="text-emerald-300 font-medium hover:underline"
                  >
                    {child.title}
                  </Link>
                  {child.excerpt && (
                    <p className="text-xs text-slate-500 mt-1">
                      {child.excerpt}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </main>
  );
}