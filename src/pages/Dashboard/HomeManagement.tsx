import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function HomeManagement() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [homePageId, setHomePageId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function loadHomePage() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("pages")
        .select("id")
        .eq("slug", "home")
        .maybeSingle();

      if (!alive) return;

      if (error) {
        console.error("[HomeManagement] error loading home page:", error);
        setError("Error loading home page info.");
      } else {
        setHomePageId(data?.id ?? null);
      }

      setLoading(false);
    }

    loadHomePage();

    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading home page info...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Home content</h1>
          <p className="text-sm text-slate-400">
            Edit the main landing page content shown at <code>/</code>.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (homePageId) {
              navigate(`/dashboard/pages/${homePageId}`);
            } else {
              navigate("/dashboard/pages/new");
            }
          }}
          className="px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-600 text-sm font-medium text-white"
        >
          {homePageId ? "Edit home page" : "Create home page"}
        </button>
      </header>

      {error && (
        <p className="text-sm text-red-400">
          {error}
        </p>
      )}

      <p className="text-sm text-slate-500">
        This is just a shortcut. The home page is a normal page in the “Pages” section
        with <code>slug = "home"</code>.
      </p>
    </div>
  );
}