import { Link } from "react-router-dom";
import { usePages } from "../features/content/hooks/usePages";

export default function PagesManager() {
  const { pages, loading, error } = usePages();

  if (loading) return <p>Loading pages...</p>;
  if (error) return <p>Could not load pages.</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Pages</h1>
        <Link
          to="/dashboard/pages/new"
          className="px-3 py-2 rounded bg-emerald-500 text-white text-sm"
        >
          Add New
        </Link>
      </div>

      <div className="bg-slate-900/40 border border-slate-800 rounded">
        <table className="w-full text-sm">
          <thead className="text-slate-400">
            <tr className="border-b border-slate-800">
              <th className="text-left p-3">Title</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Updated</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p.id} className="border-b border-slate-800">
                <td className="p-3">
                  <Link
                    to={`/dashboard/pages/${p.id}`}
                    className="text-emerald-200 hover:underline"
                  >
                    {p.title}
                  </Link>
                  <div className="text-xs text-slate-500">{p.slug}</div>
                </td>
                <td className="p-3">{p.status}</td>
                <td className="p-3">
                  {new Date(p.updated_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}