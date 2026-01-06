import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export type AppUserRole = "user" | "editor" | "admin";
export type AppUserStatus = "active" | "disabled";

export type AppUser = {
  id: string;
  username: string;
  email: string;
  role: AppUserRole;
  status: AppUserStatus;
  created_at: string | null;
};

export function useAdminUsers() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("users")
      .select("id, username, email, role, status, created_at")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[useAdminUsers] fetch error:", error);
      setError(error.message);
      setUsers([]);
    } else {
      setUsers((data ?? []) as AppUser[]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function updateUserRole(userId: string, newRole: AppUserRole) {
    setSaving(true);
    setError(null);

    try {
      // 1) update users table
      const { data, error } = await supabase
        .from("users")
        .update({ role: newRole })
        .eq("id", userId)
        .select("id, username, email, role, status, created_at")
        .single<AppUser>();

      if (error) throw error;

      // 2) sync with admins table
      if (newRole === "admin") {
        // admin exists, insert if not
        const { error: adminErr } = await supabase
          .from("admins")
          .upsert({ id: userId });

        if (adminErr) throw adminErr;
      } else {
        // delete admin if exists
        const { error: delErr } = await supabase
          .from("admins")
          .delete()
          .eq("id", userId);

        if (delErr) throw delErr;
      }

      // 3) update state
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? (data as AppUser) : u))
      );
    } catch (e: any) {
      console.error("[useAdminUsers] updateUserRole error:", e);
      setError(e.message ?? "Error updating user role");
    } finally {
      setSaving(false);
    }
  }

  async function updateUserStatus(userId: string, newStatus: AppUserStatus) {
    setSaving(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("users")
        .update({ status: newStatus })
        .eq("id", userId)
        .select("id, username, email, role, status, created_at")
        .single<AppUser>();

      if (error) throw error;

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? (data as AppUser) : u))
      );
    } catch (e: any) {
      console.error("[useAdminUsers] updateUserStatus error:", e);
      setError(e.message ?? "Error updating user status");
    } finally {
      setSaving(false);
    }
  }

  async function inviteUser(input: {
    email: string;
    username: string;
    role: AppUserRole;
  }) {
    setSaving(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke("invite-user", {
        body: input,
      });

      if (error) throw error;

      await fetchUsers();

      return data;
    } catch (e: any) {
      console.error("[useAdminUsers] inviteUser error:", e);
      setError(e.message ?? "Error sending invitation");
      throw e;
    } finally {
      setSaving(false);
    }
  }

  return {
    users,
    loading,
    saving,
    error,
    refresh: fetchUsers,
    updateUserRole,
    updateUserStatus,
    inviteUser,
  };
}