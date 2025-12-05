import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Calendar from "../pages/Calendar";
import Login from "../pages/Login";
import Register from "../pages/Register";
import EmailConfirmation from "../pages/EmailConfirmation";
import Profile from "../pages/Profile";
import Dashboard from "../pages/Dashboard";
import UserManagement from "../pages/UserManagement";
import { RequireAuth } from "./RequireAuth";
import { RequireRole } from "./RequireRole";

export default function PagesRoutes(){
    return(
        <>
            <Routes>
                {/* Public */}
                <Route path="/" element={<Home />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/emailconfirmation" element={<EmailConfirmation />} />
                <Route path="/profile" element={<Profile />} />

                {/* Dashboard */}
                <Route path="/dashboard" element={
                    <RequireAuth>
                        <RequireRole allowedRoles={["editor", "admin"]}>
                            <Dashboard />
                        </RequireRole>
                    </RequireAuth>} 
                />

                {/* Admin */}
                <Route path="/dashboard/users" element={
                    <RequireAuth>
                        <RequireRole allowedRoles={["admin"]}>
                            <UserManagement />
                        </RequireRole>
                    </RequireAuth>}
                />
            </Routes>
        </>
    )
}