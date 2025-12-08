import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Calendar from "../pages/Calendar";
import Pages from "../pages/Pages";
import Posts from "../pages/Posts";
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

import CalendarManagement from "../pages/CalendarManagement";
import PagesManagement from "../pages/PagesManagement";
import PostsManagement from "../pages/PostsManagement";

export default function PagesRoutes() {
  return (
    <Routes>
      {/* PUBLIC LAYOUT */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/pages" element={<Pages />} />
        <Route path="/posts" element={<Posts />} />
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
      <Route path="calendar-management" element={<CalendarManagement />} />

      {/* /dashboard/users (admin only) */}
      <Route path="users" element={
          <RequireRole allowedRoles={["admin"]}>
            <UserManagement />
          </RequireRole>
        }
      />
      {/* /dashboard/pages */}
      <Route path="pages-management" element={<PagesManagement />} />

      {/* /dashboard/posts */}
      <Route path="posts-management" element={<PostsManagement />} />
      </Route>

      <Route path="/access-denied" element={<AccessDenied />} />
    </Routes>
  );
}