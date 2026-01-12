import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { usePages } from "../../features/content/hooks/usePages";
import { useUserRole } from "../../hooks/useUserRole";
import {
  Search as SearchIcon,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type SortField = "title" | "updated_at";

const PAGE_SIZE = 10;

export default function PagesManagement() {
  const navigate = useNavigate();
  const { pages, loading, error, refetch } = usePages();
  const { role } = useUserRole();
  const isAdmin = role === "admin";

  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("updated_at");
  const [ascending, setAscending] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredAndSorted = useMemo(() => {
    if (loading || error) return [];

    const q = search.trim().toLowerCase();
    let list = pages;

    if (q) {
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.slug ?? "").toLowerCase().includes(q)
      );
    }

    const sorted = [...list].sort((a, b) => {
      let cmp = 0;

      if (sortField === "title") {
        cmp = a.title.localeCompare(b.title);
      } else if (sortField === "updated_at") {
        cmp =
          new Date(a.updated_at).getTime() -
          new Date(b.updated_at).getTime();
      }

      return ascending ? cmp : -cmp;
    });

    return sorted;
  }, [pages, search, sortField, ascending, loading, error]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAndSorted.length / PAGE_SIZE)
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const visiblePages = filteredAndSorted.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  const handleSortChange = (newField: SortField) => {
    if (sortField === newField) {
      setAscending((prev) => !prev);
    } else {
      setSortField(newField);
      setAscending(true);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  async function handleDelete(id: string, title: string) {
    if (!isAdmin) return;

    const sure = window.confirm(
      `Are you sure you want to delete the page "${title}"? This action cannot be undone.`
    );
    if (!sure) return;

    try {
      const { error: deleteError } = await supabase
        .from("pages")
        .delete()
        .eq("id", id);
      if (deleteError) throw deleteError;
      await refetch();
    } catch (e: any) {
      console.error("[PagesManagement] delete error:", e);
      alert(e.message ?? "Error deleting page.");
    }
  }

  async function handleStatusChange(
    id: string,
    newStatus: "draft" | "published"
  ) {
    if (!isAdmin) return;

    try {
      const { error: updateError } = await supabase
        .from("pages")
        .update({ status: newStatus })
        .eq("id", id);

      if (updateError) throw updateError;
      await refetch();
    } catch (e: any) {
      console.error("[PagesManagement] status update error:", e);
      alert(e.message ?? "Error updating status.");
    }
  }

  if (loading) return <p>Loading pages...</p>;
  if (error) return <p>Could not load pages.</p>;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-xl font-semibold">Pages</h1>
        <button
          type="button"
          onClick={() => navigate("/dashboard/pages/new")}
          className="px-3 py-2 rounded bg-emerald-500 text-white text-sm hover:bg-emerald-600"
        >
          Add New
        </button>
      </div>

      {/* Search + sort + pagination */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by title or slug..."
            className="w-full pl-9 pr-3 py-2 rounded bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Sort + pagination */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4 md:justify-end">
          {/* Sort */}
          <div className="flex items-center gap-2">
            <select
              value={sortField}
              onChange={(e) =>
                handleSortChange(e.target.value as SortField)
              }
              className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-100"
            >
              <option value="updated_at">Sort by updated</option>
              <option value="title">Sort by title</option>
            </select>

            <button
              type="button"
              onClick={() => handleSortChange(sortField)}
              className="border border-slate-700 rounded p-1.5 hover:bg-slate-800"
              title={ascending ? "Ascending" : "Descending"}
            >
              <ArrowUpDown
                size={16}
                className={`transition-transform ${
                  ascending ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {/* Pagination */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <button
              type="button"
              onClick={() =>
                setCurrentPage((p) => Math.max(1, p - 1))
              }
              disabled={currentPage <= 1}
              className="border border-slate-700 rounded p-1 disabled:opacity-40 hover:bg-slate-800"
            >
              <ChevronLeft size={16} />
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() =>
                setCurrentPage((p) =>
                  Math.min(totalPages, p + 1)
                )
              }
              disabled={currentPage >= totalPages}
              className="border border-slate-700 rounded p-1 disabled:opacity-40 hover:bg-slate-800"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/40 border border-slate-800 rounded">
        <table className="w-full text-sm">
          <thead className="text-slate-400">
            <tr className="border-b border-slate-800">
              <th className="text-left p-3">Title</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Updated</th>
              {isAdmin && <th className="text-left p-3">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {visiblePages.map((p) => (
              <tr key={p.id} className="border-b border-slate-800">
                <td className="p-3">
                  <Link
                    to={`/dashboard/pages/${p.id}`}
                    className="text-emerald-200 hover:underline cursor-pointer"
                  >
                    {p.title}
                  </Link>
                  <div className="text-xs text-slate-500">{p.slug}</div>
                </td>

                <td className="p-3 capitalize">
                  {isAdmin ? (
                    <select
                      value={p.status}
                      onChange={(e) =>
                        handleStatusChange(
                          p.id,
                          e.target.value as "draft" | "published"
                        )
                      }
                      className="rounded bg-slate-950 border border-slate-800 px-2 py-1 text-xs"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  ) : (
                    p.status
                  )}
                </td>

                <td className="p-3">
                  {new Date(p.updated_at).toLocaleString()}
                </td>

                {isAdmin && (
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id, p.title)}
                      className="px-2 py-1 text-xs rounded bg-red-600 hover:bg-red-700 text-white"
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}

            {visiblePages.length === 0 && (
              <tr>
                <td
                  colSpan={isAdmin ? 4 : 3}
                  className="p-4 text-center text-slate-500 text-sm"
                >
                  No pages found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}