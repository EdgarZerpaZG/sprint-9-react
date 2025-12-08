import { useAuth } from "../../hooks/useAuth";

export default function DashboardTop() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur border-b border-slate-800">
      <div className="px-6 py-3 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400">
            Dashboard
          </p>
          <p className="text-sm text-slate-200">
            {user?.username || user?.email || "Unknown user"}
          </p>
        </div>

        <button
          onClick={logout}
          className="text-xs px-3 py-1.5 rounded border border-slate-700 hover:border-slate-500 hover:bg-slate-900 transition cursor-pointer">
          Log out
        </button>
      </div>
    </header>
  );
}