import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Calendar from "../pages/Calendar";
import Login from "../pages/Login";
import Register from "../pages/Register";
import EmailConfirmation from "../pages/EmailConfirmation";
import Profile from "../pages/Profile";

import Dashboard from "../pages/Dashboard";
import UserManagement from "../pages/UserManagement";
import AccessDenied from "../pages/AccessDenied";

import { RequireAuth } from "./RequireAuth";
import { RequireRole } from "./RequireRole";

import PublicLayout from "../layout/PublicLayout";
import DashboardLayout from "../layout/DashboardLayout";

// Si quieres crear una página específica para calendario dentro del dashboard,
// puedes reutilizar tu page Calendar o crear DashboardCalendar.
import DashboardCalendar from "../pages/Calendar"; // temporal

export default function PagesRoutes() {
  return (
    <Routes>
      {/* PUBLIC LAYOUT */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/calendar" element={<Calendar />} />
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
          </RequireAuth>}
      >
      {/* /dashboard */}
      <Route index element={<Dashboard />} />

      {/* /dashboard/calendar */}
      <Route path="calendar" element={<DashboardCalendar />} />

      {/* /dashboard/users (solo admin) */}
      <Route
        path="users"
        element={
          <RequireRole allowedRoles={["admin"]}>
            <UserManagement />
          </RequireRole>
        }
      />

      {/* futuras rutas */}
      {/* <Route path="pages" element={<PagesManager />} /> */}
      {/* <Route path="posts" element={<PostsManager />} /> */}
      </Route>

      <Route path="/access-denied" element={<AccessDenied />} />
    </Routes>
  );
}