import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./useAuth";

type Role = "user" | "editor" | "admin";

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<Role>("user");
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    let alive = true;

    async function loadRole() {
      if (!user?.id) {
        if (alive) {
          setRole("user");
          setLoadingRole(false);
        }
        return;
      }

      setLoadingRole(true);

      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (!alive) return;

      if (error) {
        console.error("[useUserRole] error:", error);
        setRole("user");
      } else {
        setRole((data?.role as Role) ?? "user");
      }

      setLoadingRole(false);
    }

    loadRole();

    return () => {
      alive = false;
    };
  }, [user?.id]);

  return { role, loadingRole };
}