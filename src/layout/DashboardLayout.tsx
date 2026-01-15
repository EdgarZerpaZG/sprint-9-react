import { useState, useEffect, useMemo } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useUserRole } from "../hooks/useUserRole";
import DashboardTop from "../components/Dashboard/DashboardTop";
import { usePagesNavTree } from "../hooks/usePagesNavTree";
import { useSiteSettings } from "../hooks/useSiteSettings";
import { Menu, X } from "lucide-react";

export default function DashboardLayout() {
  const { role, loadingRole } = useUserRole();
  const { tree, loading: loadingPages } = usePagesNavTree();
  const { settings, loading: loadingSettings } = useSiteSettings();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const managerTitle = useMemo(
    () => settings?.manager_title?.trim() || "ManagementZG",
    [settings?.manager_title]
  );

  useEffect(() => {
    document.title = `${managerTitle} | Dashboard`;
  }, [managerTitle]);

  if (loadingRole || loadingPages || loadingSettings) {
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

  const navClass = ({ isActive }: { isActive: boolean }) =>
    [linkBase, isActive ? linkActive : linkIdle].join(" ");

  const handleNavClick = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`w-64 bg-slate-900 border-r border-slate-800 fixed inset-y-0 left-0 transform transition-transform duration-200 z-40
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Brand */}
        <div className="px-4 py-5 border-b border-slate-800">
          <p className="text-xs uppercase tracking-widest text-slate-400">
            Admin Panel
          </p>
          <h2 className="text-lg font-semibold">{managerTitle}</h2>
        </div>

        {/* Nav */}
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-64px)]">
          {/* Admin only */}
          {role === "admin" && (
            <>
              <p className="px-3 pt-2 text-xs uppercase tracking-widest text-slate-500">
                Core Management
              </p>
              <NavLink
                to="users"
                className={navClass}
                onClick={handleNavClick}
              >
                Users
              </NavLink>

                {/* NEW: Settings */}
              <NavLink
                to="settings-management"
                className={navClass}
                onClick={handleNavClick}
              >
                Settings
              </NavLink>
            </>
          )}

          {/* Pages management */}
          <p className="px-3 pt-2 text-xs uppercase tracking-widest text-slate-500">
            Pages Management
          </p>
          <NavLink
            to="pages-management"
            className={navClass}
            onClick={handleNavClick}
          >
            Pages
          </NavLink>

          {/* Content */}
          <div className="pt-3 mt-3 border-t border-slate-800 space-y-2">
            <p className="px-3 text-xs uppercase tracking-widest text-slate-500">
              Home Content
            </p>

            {/* HOME */}
            {tree.home && (
              <NavLink
                to={`pages/${tree.home.id}`}
                className={navClass}
                onClick={handleNavClick}
              >
                Home
              </NavLink>
            )}

            {/* COLLECTIONS + CONTENT */}
            {tree.collections.length > 0 && (
              <div className="space-y-1">
                <p className="px-3 text-[11px] uppercase tracking-widest text-slate-500">
                  Collections
                </p>

                {tree.collections.map((col) => (
                  <div key={col.id} className="ml-1">
                    {/* Link to the collection itself */}
                    <NavLink
                      to={`pages/${col.id}`}
                      className={navClass}
                      onClick={handleNavClick}
                    >
                      {col.title}
                    </NavLink>

                    {/* Children of type content */}
                    {col.children.length > 0 && (
                      <div className="ml-3 mt-1 border-l border-slate-800 pl-2 space-y-1">
                        {col.children.map((child) => (
                          <NavLink
                            key={child.id}
                            to={`pages/${child.id}`}
                            className={navClass}
                            onClick={handleNavClick}
                          >
                            · {child.title}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* MAIN PAGES */}
            {tree.mains.length > 0 && (
              <div className="space-y-1">
                <p className="px-3 text-[11px] uppercase tracking-widest text-slate-500">
                  Main pages
                </p>
                {tree.mains.map((page) => (
                  <NavLink
                    key={page.id}
                    to={`pages/${page.id}`}
                    className={navClass}
                    onClick={handleNavClick}
                  >
                    {page.title}
                  </NavLink>
                ))}
              </div>
            )}

            {/* FOOTER */}
            {tree.footer && (
              <div className="space-y-1 pt-2 border-t border-slate-800 mt-2">
                <p className="px-3 text-[11px] uppercase tracking-widest text-slate-500">
                  Footer Content
                </p>
                <NavLink
                  to={`pages/${tree.footer.id}`}
                  className={navClass}
                  onClick={handleNavClick}
                >
                  Footer
                </NavLink>
              </div>
            )}
          </div>
        </nav>
      </aside>

      <div className="min-h-screen lg:ml-64">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950 sticky top-0 z-20">
          <button
            type="button"
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="inline-flex items-center justify-center rounded-md border border-slate-700 px-2.5 py-1.5 text-slate-100 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
          <span className="text-sm font-semibold">{managerTitle}</span>
        </div>

        {/* Dashboard Top */}
        <DashboardTop />

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}