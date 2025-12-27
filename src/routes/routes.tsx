import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Calendar from "../pages/Calendar";
import Pages from "../pages/Pages";
import Posts from "../pages/Posts";
import PageDetail from "../pages/PageDetail";
import PostDetail from "../pages/PostDetail";
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

import HomeManagement from "../pages/Dashboard/HomeManagement";
import HomeEditor from "../pages/Dashboard/HomeEditor";

import DashboardLayout from "../layout/DashboardLayout";

import CalendarManagement from "../pages/Dashboard/CalendarManagement";
import PagesManagement from "../pages/Dashboard/PagesManagement";
import PostsManagement from "../pages/Dashboard/PostsManagement";

import PageEditor from "../pages/Dashboard/PageEditor";
import PostEditor from "../pages/Dashboard/PostEditor";

export default function PagesRoutes() {
  return (
    <Routes>
      {/* PUBLIC LAYOUT */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/pages" element={<Pages />} />
        <Route path="/pages/:slug" element={<PageDetail />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/posts/:slug" element={<PostDetail />} />
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
      {/* /dashboard */}
      <Route index element={<Dashboard />} />

      {/* /dashboard/home */}
      <Route path="home-management" element={<HomeManagement />} />
      <Route path="home-management/edit" element={<HomeEditor />} />

      {/* /dashboard/calendar */}
      <Route path="calendar-management" element={<CalendarManagement />} />

      {/* /dashboard/users (admin only) */}
      <Route path="users" element={
        <RequireRole allowedRoles={["admin"]}>
          <UserManagement />
        </RequireRole>}
      />

      {/* PAGES MANAGEMENT */}
      {/* /dashboard/pages */}
      <Route path="pages-management" element={<PagesManagement />} />
      <Route path="pages/new" element={<PageEditor />} />
      <Route path="pages/:id" element={<PageEditor />} />

      <Route path="posts-management" element={<PostsManagement />} />
      <Route path="posts/new" element={<PostEditor />} />
      <Route path="posts/:id" element={<PostEditor />} />
      </Route>

      <Route path="/access-denied" element={<AccessDenied />} />
    </Routes>
  );
}