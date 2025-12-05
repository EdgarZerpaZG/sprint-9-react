import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { ReactNode } from "react";

type Props = {
  allowedRoles: Array<"user" | "editor" | "admin">;
  children: ReactNode;
};

export function RequireRole({ allowedRoles, children }: Props) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <p>Checking permissions...</p>
      </div>
    );
  }

  if (!user || !user.role || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}