import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./useAuth";

export function useIsAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingAdmin, setLoadingAdmin] = useState(true);

  useEffect(() => {
    let alive = true;

    async function check() {
      if (!user?.id) {
        if (alive) {
          setIsAdmin(false);
          setLoadingAdmin(false);
        }
        return;
      }

      const { data, error } = await supabase
        .from("admins")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (!alive) return;

      setIsAdmin(!error && !!data);
      setLoadingAdmin(false);
    }

    check();

    return () => {
      alive = false;
    };
  }, [user?.id]);

  return { isAdmin, loadingAdmin };
}