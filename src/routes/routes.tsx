import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Calendar from "../pages/Calendar";
import Pages from "../pages/Pages";
import PageDetail from "../pages/PageDetail";
import Login from "../pages/Login";
import Register from "../pages/Register";
import EmailConfirmation from "../pages/EmailConfirmation";
import Profile from "../pages/Profile";

import Dashboard from "../pages/Dashboard";
import UserManagement from "../pages/Dashboard/UserManagement";
import AccessDenied from "../pages/AccessDenied";

import { RequireAuth } from "./RequireAuth";
import { RequireRole } from "./RequireRole";

import PublicLayout from "../layout/PublicLayout";
import DashboardLayout from "../layout/DashboardLayout";

import SettingsManagement from "../pages/Dashboard/SettingsManagement";

import HomeManagement from "../pages/Dashboard/HomeManagement";
import HomeEditor from "../pages/Dashboard/HomeEditor";

import PagesManagement from "../pages/Dashboard/PagesManagement";
import PageEditor from "../pages/Dashboard/PageEditor";

import FooterEditor from "../pages/Dashboard/FooterEditor";

export default function PagesRoutes() {
  return (
    <Routes>
      {/* PUBLIC LAYOUT */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/calendar" element={<Calendar />} />

        <Route path="/pages" element={<Pages />} />
        <Route path="/pages/:slug" element={<PageDetail />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/emailconfirmation" element={<EmailConfirmation />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* DASHBOARD AREA */}
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <RequireRole allowedRoles={["editor", "admin"]}>
              <DashboardLayout />
            </RequireRole>
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />

        <Route path="home-management" element={<HomeManagement />} />
        <Route path="home-management/edit" element={<HomeEditor />} />

        <Route
          path="settings-management"
          element={
            <RequireRole allowedRoles={["admin"]}>
              <SettingsManagement />
            </RequireRole>
          }
        />

        <Route
          path="users"
          element={
            <RequireRole allowedRoles={["admin"]}>
              <UserManagement />
            </RequireRole>
          }
        />

        <Route path="pages-management" element={<PagesManagement />} />
        <Route path="pages/new" element={<PageEditor />} />
        <Route path="pages/:id" element={<PageEditor />} />

        <Route path="footer-management" element={<FooterEditor />} />
      </Route>

      <Route path="/access-denied" element={<AccessDenied />} />
    </Routes>
  );
}