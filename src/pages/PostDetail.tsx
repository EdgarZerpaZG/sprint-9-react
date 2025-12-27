import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import type { PostRow } from "../types/contentTypes";
import BlocksRenderer from "../components/content/BlocksRenderer";
import { useUserRole } from "../hooks/useUserRole";

export default function PostDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { role, loadingRole } = useUserRole();

  const [post, setPost] = useState<PostRow | null>(null);
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
        .from("posts")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (!alive) return;

      if (error) {
        console.error("[PostDetail] error loading post:", error);
        setError("Could not load the post.");
      } else if (!data) {
        setError("Post not found.");
      } else {
        setPost(data as PostRow);
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

  if (!post) {
    return (
      <main className="max-w-3xl mx-auto py-10">
        <p>Post not found.</p>
      </main>
    );
  }

  const isDraft = post.status === "draft";
  const canSeeDraft = role === "editor" || role === "admin";

  if (isDraft && !canSeeDraft) {
    return (
      <main className="max-w-3xl mx-auto py-10">
        <p>This post is not published yet.</p>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto py-10 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">{post.title}</h1>

        {post.excerpt && (
          <p className="text-slate-500 text-sm">{post.excerpt}</p>
        )}

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
          <span>
            {post.published_at
              ? `Published: ${new Date(post.published_at).toLocaleDateString()}`
              : `Created: ${new Date(post.created_at).toLocaleDateString()}`}
          </span>

          {post.category && (
            <span className="inline-flex items-center rounded-full bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-200">
              {post.category}
            </span>
          )}

          {isDraft && (
            <span className="inline-flex items-center rounded-full bg-yellow-500/10 px-2 py-0.5 text-[11px] font-medium text-yellow-500">
              Draft
            </span>
          )}
        </div>
      </header>

      <section className="prose prose-invert max-w-none">
        <BlocksRenderer blocks={post.blocks ?? []} />
      </section>
    </main>
  );
}