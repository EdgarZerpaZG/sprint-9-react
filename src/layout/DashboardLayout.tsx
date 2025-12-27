import { NavLink, Outlet } from "react-router-dom";
import { useUserRole } from "../hooks/useUserRole";
import DashboardTop from "../components/Dashboard/DashboardTop";

export default function DashboardLayout() {
  const { role, loadingRole } = useUserRole();

  if (loadingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const linkBase =
    "block px-3 py-2 rounded text-sm transition-colors duration-150";
  const linkActive = "bg-emerald-500/20 text-emerald-200";
  const linkIdle = "hover:bg-slate-800 text-slate-200";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 fixed inset-y-0 left-0">
        {/* Brand */}
        <div className="px-4 py-5 border-b border-slate-800">
          <p className="text-xs uppercase tracking-widest text-slate-400">
            Admin Panel
          </p>
          <h2 className="text-lg font-semibold">Animal Shelter CMS</h2>
        </div>

        {/* Nav */}
        <nav className="p-3 space-y-1">
          {/* Core */}
          <p className="px-3 pt-2 text-xs uppercase tracking-widest text-slate-500">
            Core
          </p>

          <NavLink
            to=""
            end
            className={({ isActive }) =>
              [linkBase, isActive ? linkActive : linkIdle].join(" ")}>
            Overview
          </NavLink>

          <NavLink
            to="home-management"
            className={({ isActive }) =>
              [linkBase, isActive ? linkActive : linkIdle].join(" ")}>
            Home
          </NavLink>

          <NavLink
            to="calendar-management"
            className={({ isActive }) =>
              [linkBase, isActive ? linkActive : linkIdle].join(" ")}>
            Bookings
          </NavLink>

          {/* Admin only */}
          {role === "admin" && (
            <NavLink
              to="users"
              className={({ isActive }) =>
                [linkBase, isActive ? linkActive : linkIdle].join(" ")}>
              Users
            </NavLink>
          )}

          {/* Content */}
          <div className="pt-3 mt-3 border-t border-slate-800">
            <p className="px-3 text-xs uppercase tracking-widest text-slate-500">
              Content
            </p>

            <NavLink
              to="pages-management"
              className={({ isActive }) =>
                [linkBase, isActive ? linkActive : linkIdle].join(" ")}>
              Pages
            </NavLink>

            <NavLink
              to="posts-management"
              className={({ isActive }) =>
                [linkBase, isActive ? linkActive : linkIdle].join(" ")}>
              Posts
            </NavLink>

            <NavLink
              to="media-management"
              className={({ isActive }) =>
                [linkBase, isActive ? linkActive : linkIdle].join(" ")}>
              Media (soon)
            </NavLink>
          </div>

          {/* Settings placeholder */}
          <div className="pt-3 mt-3 border-t border-slate-800">
            <p className="px-3 text-xs uppercase tracking-widest text-slate-500">
              System
            </p>

            <NavLink
              to="settings"
              className={({ isActive }) =>
                [linkBase, isActive ? linkActive : linkIdle].join(" ")}>
              Settings (soon)
            </NavLink>
          </div>
        </nav>
      </aside>

      {/* Content area */}
      <div className="ml-64 min-h-screen">
        <DashboardTop />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}