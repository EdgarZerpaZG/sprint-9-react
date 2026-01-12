import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import BlocksRenderer from "../components/content/BlocksRenderer";
import { useUserRole } from "../hooks/useUserRole";
import type { Block, ContentStatus, PageRow } from "../types/contentTypes";

type HomePage = PageRow;

export default function Home() {
  const { role, loadingRole } = useUserRole();

  const [home, setHome] = useState<HomePage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function loadHome() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("type", "home")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle<HomePage>();

      if (!alive) return;

      if (error) {
        console.error("[Home] error loading home page:", error);
        setError("Could not load home page content.");
      } else {
        setHome(data ?? null);
      }

      setLoading(false);
    }

    loadHome();

    return () => {
      alive = false;
    };
  }, []);

  if (loading || loadingRole) {
    return (
      <main className="max-w-3xl mx-auto py-10">
        <p>Loading home...</p>
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

  if (!home) {
    return (
      <main className="max-w-3xl mx-auto py-10 space-y-4">
        <h1 className="text-3xl font-bold">Animal Shelter</h1>
        <p className="text-slate-600">
          No home content found yet. Please create a Home page (type "home")
          from the dashboard.
        </p>
      </main>
    );
  }

  const isDraft: ContentStatus = home.status;
  const isDraftStatus = isDraft === "draft";
  const canSeeDraft = role === "editor" || role === "admin";

  if (isDraftStatus && !canSeeDraft) {
    return (
      <main className="max-w-3xl mx-auto py-10 space-y-4">
        <h1 className="text-3xl font-bold">Animal Shelter</h1>
        <p>This home page is not published yet.</p>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <section className="prose prose-slate max-w-none">
        <BlocksRenderer blocks={(home.blocks as Block[]) ?? []} />
      </section>
    </main>
  );
}