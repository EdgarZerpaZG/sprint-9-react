import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import { useUserRole } from "../hooks/useUserRole";

type Props = {
  allowedRoles: Array<"user" | "editor" | "admin">;
  children: ReactNode;
};

export function RequireRole({ allowedRoles, children }: Props) {
  const { user, loading } = useAuth();
  const { role, loadingRole } = useUserRole();

  if (loading || loadingRole) {
    return (
      <div className="flex justify-center items-center py-10">
        <p>Checking permissions...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
}