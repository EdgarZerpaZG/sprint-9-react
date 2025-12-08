import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useUserRole } from "../../hooks/useUserRole";
import Facebook from "./../../assets/icon-facebook.svg";
import Twitter from "./../../assets/icon-twitter.svg";

export default function Top() {
  const { user, logout } = useAuth();
  const { role, loadingRole } = useUserRole();

  const canAccessDashboard =
    !loadingRole && (role === "editor" || role === "admin");

  return (
    <div className="relative flex justify-between">
      <ul className="flex">
        <li className="px-2 py-2">
          <Link to="https://www.facebook.com" target="_blank">
            <img src={Facebook} alt="Facebook" />
          </Link>
        </li>
        <li className="px-2 py-2">
          <Link to="https://www.twitter.com" target="_blank">
            <img src={Twitter} alt="Twitter" />
          </Link>
        </li>
      </ul>

      <ul className="flex items-center space-x-4">
        {!user ? (
          <Link to="/login">
            <li className="px-2 py-2 hover:text-gray-500 uppercase font-bold cursor-pointer">
              LOG IN
            </li>
          </Link>
        ) : (
          <>
            {canAccessDashboard && (
              <Link
                to="/dashboard"
                target="_blank"
                rel="noopener noreferrer"
              >
                <li className="px-2 py-2 hover:text-gray-500 uppercase font-bold cursor-pointer">
                  DASHBOARD
                </li>
              </Link>
            )}

            <Link to="/profile">
              <li className="px-2 py-2 hover:text-gray-500 uppercase font-bold cursor-pointer">
                {user.username || user.email}
              </li>
            </Link>

            <li
              onClick={logout}
              className="px-2 py-2 text-red-400 hover:text-red-600 uppercase font-bold cursor-pointer"
            >
              LOG OUT
            </li>
          </>
        )}
      </ul>
    </div>
  );
}