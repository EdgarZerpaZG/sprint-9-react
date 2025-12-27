import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import type { PageRow } from "../types/contentTypes";
import BlocksRenderer from "../components/content/BlocksRenderer";
import { useUserRole } from "../hooks/useUserRole";

export default function PageDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { role, loadingRole } = useUserRole();

  const [page, setPage] = useState<PageRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (!alive) return;

      if (error) {
        console.error("[PageDetail] error loading page:", error);
        setError("Could not load the page.");
      } else if (!data) {
        setError("Page not found.");
      } else {
        setPage(data as PageRow);
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
  const canSeeDraft = role === "editor" || role === "admin";

  if (isDraft && !canSeeDraft) {
    return (
      <main className="max-w-3xl mx-auto py-10">
        <p>This page is not published yet.</p>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto py-10 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">{page.title}</h1>

        {page.excerpt && (
          <p className="text-slate-500 text-sm">{page.excerpt}</p>
        )}

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span>
            {page.published_at
              ? `Published: ${new Date(page.published_at).toLocaleDateString()}`
              : `Created: ${new Date(page.created_at).toLocaleDateString()}`}
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
    </main>
  );
}