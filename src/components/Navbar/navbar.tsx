import { useState, useEffect, useMemo } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Top from "./top";
import "../../App.css";
import Shelter from "../../assets/shelter.png";
import { useNavPages } from "../../hooks/useNavPages";
import { resolvePublicPath } from "../../utils/resolvePublicPath";
import { useSiteSettings } from "../../hooks/useSiteSettings";

export default function Navbar() {
  const { home, mains, collections } = useNavPages();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { settings, loading } = useSiteSettings();

  const siteName = useMemo(() => {
    if (loading) return "";
    return settings?.manager_title?.trim() || "ManagementZG";
  }, [loading, settings?.manager_title]);

  const logoSrc = useMemo(() => {
    const url = settings?.logo_url?.trim();
    return url && url.length > 0 ? url : Shelter;
  }, [settings?.logo_url]);

  const showCalendar = settings?.show_calendar ?? true;

  useEffect(() => {
    if (!siteName) return;
    document.title = siteName;
  }, [siteName]);

  useEffect(() => {
    if (!logoSrc) return;

    const setFavicon = (href: string) => {
      let link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;

      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }

      link.href = href;
    };

    setFavicon(logoSrc);
  }, [logoSrc]);

  const handleToggleMenu = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleLinkClick = () => {
    setMobileOpen(false);
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
      "px-3 py-1.5 rounded-md transition-colors",
      "uppercase text-xs sm:text-sm",
      isActive
        ? "bg-slate-800 text-emerald-300"
        : "text-slate-100 hover:bg-slate-800 hover:text-emerald-300",
    ].join(" ");

  const homePath = home ? resolvePublicPath(home) : "/";

  return (
    <nav className="navbar fixed inset-x-0 top-0 z-10 bg-slate-950/95 border-b border-slate-800 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between gap-3">
          <Link
            className="flex items-center gap-2 text-slate-50 font-semibold text-lg"
            to="/"
            onClick={handleLinkClick}
          >
            <img
              src={logoSrc}
              alt="Logo"
              className="h-10 w-10 inline-block rounded-lg border border-emerald-500/40 bg-slate-900 object-cover"
            />
            {siteName && (
              <span className="hidden sm:inline">{siteName}</span>
            )}
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden lg:block">
              <Top />
            </div>

            <button
              type="button"
              onClick={handleToggleMenu}
              className="lg:hidden inline-flex items-center justify-center rounded-md border border-slate-700 px-2.5 py-1.5 text-slate-100 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              aria-label="Toggle navigation"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center justify-center mt-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <NavLink to={homePath} className={navLinkClass}>
              Home
            </NavLink>

            {showCalendar && (
              <NavLink to="/calendar" className={navLinkClass}>
                Calendar
              </NavLink>
            )}

            {collections.map((c) => (
              <NavLink
                key={c.id}
                to={resolvePublicPath(c)}
                className={navLinkClass}
              >
                {c.title}
              </NavLink>
            ))}

            {mains.map((m) => (
              <NavLink
                key={m.id}
                to={resolvePublicPath(m)}
                className={navLinkClass}
              >
                {m.title}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Mobile nav */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-200 ${
            mobileOpen ? "max-h-[500px] mt-2" : "max-h-0"
          }`}
        >
          <div className="border-t border-slate-800 pt-2 space-y-3">
            <Top />

            <div className="flex flex-col gap-1">
              <NavLink
                to={homePath}
                className={navLinkClass}
                onClick={handleLinkClick}
              >
                Home
              </NavLink>

              {showCalendar && (
                <NavLink
                  to="/calendar"
                  className={navLinkClass}
                  onClick={handleLinkClick}
                >
                  Calendar
                </NavLink>
              )}

              {collections.map((c) => (
                <NavLink
                  key={c.id}
                  to={resolvePublicPath(c)}
                  className={navLinkClass}
                  onClick={handleLinkClick}
                >
                  {c.title}
                </NavLink>
              ))}

              {mains.map((m) => (
                <NavLink
                  key={m.id}
                  to={resolvePublicPath(m)}
                  className={navLinkClass}
                  onClick={handleLinkClick}
                >
                  {m.title}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}