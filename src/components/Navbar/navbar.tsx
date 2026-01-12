import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Top from "./top";
import "../../App.css";
import Shlter from "../../assets/shelter.png";
import { useNavPages } from "../../hooks/useNavPages";
import { resolvePublicPath } from "../../utils/resolvePublicPath";

export default function Navbar() {
  const { home, mains, collections } = useNavPages();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggleMenu = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleLinkClick = () => {
    setMobileOpen(false);
  };

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
              src={Shlter}
              alt="Shelter Logo"
              className="h-10 w-10 inline-block rounded-lg border border-emerald-500/40 bg-slate-900"
            />
            <span className="hidden sm:inline">ShellPets</span>
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

        <div className="hidden lg:flex items-center justify-between mt-2">
          <div className="flex items-center gap-2 sm:gap-3 uppercase text-xs sm:text-sm">
            <Link
              className="px-3 py-1.5 rounded-md text-slate-100 hover:bg-slate-800 hover:text-emerald-300 transition-colors"
              to={home ? resolvePublicPath(home) : "/"}
            >
              Home
            </Link>

            <Link
              className="px-3 py-1.5 rounded-md text-slate-100 hover:bg-slate-800 hover:text-emerald-300 transition-colors"
              to="/calendar"
            >
              Calendar
            </Link>

            {collections.map((c) => (
              <Link
                key={c.id}
                className="px-3 py-1.5 rounded-md text-slate-100 hover:bg-slate-800 hover:text-emerald-300 transition-colors"
                to={resolvePublicPath(c)}
              >
                {c.title}
              </Link>
            ))}

            {mains.map((m) => (
              <Link
                key={m.id}
                className="px-3 py-1.5 rounded-md text-slate-100 hover:bg-slate-800 hover:text-emerald-300 transition-colors"
                to={resolvePublicPath(m)}
              >
                {m.title}
              </Link>
            ))}
          </div>
        </div>

        <div
          className={`lg:hidden overflow-hidden transition-all duration-200 ${
            mobileOpen ? "max-h-[500px] mt-2" : "max-h-0"
          }`}
        >
          <div className="border-t border-slate-800 pt-2 space-y-3">
            <Top />

            <div className="flex flex-col gap-1 uppercase text-xs">
              <Link
                className="px-3 py-1.5 rounded-md text-slate-100 hover:bg-slate-800 hover:text-emerald-300 transition-colors"
                to={home ? resolvePublicPath(home) : "/"}
                onClick={handleLinkClick}
              >
                Home
              </Link>

              <Link
                className="px-3 py-1.5 rounded-md text-slate-100 hover:bg-slate-800 hover:text-emerald-300 transition-colors"
                to="/calendar"
                onClick={handleLinkClick}
              >
                Calendar
              </Link>

              {collections.map((c) => (
                <Link
                  key={c.id}
                  className="px-3 py-1.5 rounded-md text-slate-100 hover:bg-slate-800 hover:text-emerald-300 transition-colors"
                  to={resolvePublicPath(c)}
                  onClick={handleLinkClick}
                >
                  {c.title}
                </Link>
              ))}

              {mains.map((m) => (
                <Link
                  key={m.id}
                  className="px-3 py-1.5 rounded-md text-slate-100 hover:bg-slate-800 hover:text-emerald-300 transition-colors"
                  to={resolvePublicPath(m)}
                  onClick={handleLinkClick}
                >
                  {m.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}