import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./useAuth";

type Role = "user" | "editor" | "admin";

export function useUserRole() {
  const { user, loading } = useAuth();
  const [role, setRole] = useState<Role>("user");
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    let alive = true;

    if (loading) {
      setLoadingRole(true);
      return;
    }

    if (!user) {
      setRole("user");
      setLoadingRole(false);
      return;
    }

    const userId = user.id;

    async function fetchRole() {
      setLoadingRole(true);

      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

      if (!alive) return;

      if (error) {
        console.error("[useUserRole] error:", error);
        setRole("user");
      } else {
        const dbRole = data?.role as Role | undefined;
        setRole(dbRole ?? "user");
      }

      setLoadingRole(false);
    }

    fetchRole();

    return () => {
      alive = false;
    };
  }, [user?.id, loading]);

  return { role, loadingRole };
}