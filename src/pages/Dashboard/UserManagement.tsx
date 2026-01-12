import { useState } from "react";
import { useAdminUsers } from "../../hooks/useAdminUsers";
import type { AppUserRole, AppUserStatus } from "../../hooks/useAdminUsers";


export default function UserManagement() {
  const {
    users,
    loading,
    saving,
    error,
    updateUserRole,
    updateUserStatus,
    inviteUser,
  } = useAdminUsers();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteUsername, setInviteUsername] = useState("");
  const [inviteRole, setInviteRole] = useState<AppUserRole>("user");

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await inviteUser({
        email: inviteEmail.trim(),
        username: inviteUsername.trim(),
        role: inviteRole,
      });
      setInviteEmail("");
      setInviteUsername("");
      setInviteRole("user");
      setInviteOpen(false);
    } catch {
      
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-slate-400">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-sm text-slate-500">
            Solo los administradores pueden ver y gestionar esta sección.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setInviteOpen(true)}
          className="px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-600 text-sm font-medium text-white disabled:opacity-50"
          disabled={saving}
        >
          + Invite user
        </button>
      </header>

      {error && (
        <div className="rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      {/* User table */}
      <section className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/60">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900/80 text-slate-300">
            <tr>
              <th className="px-3 py-2 text-left">Username</th>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2 text-left">Role</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Created at</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-4 text-center text-slate-500"
                >
                  No users found.
                </td>
              </tr>
            )}

            {users.map((u) => (
              <tr key={u.id} className="border-t border-slate-800">
                <td className="px-3 py-2">{u.username}</td>
                <td className="px-3 py-2">{u.email}</td>

                {/* ROLE */}
                <td className="px-3 py-2">
                  <select
                    value={u.role}
                    onChange={(e) =>
                      updateUserRole(u.id, e.target.value as AppUserRole)
                    }
                    className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs"
                    disabled={saving}
                  >
                    <option value="user">user</option>
                    <option value="editor">editor</option>
                    <option value="admin">admin</option>
                  </select>
                </td>

                {/* STATUS */}
                <td className="px-3 py-2">
                  <select
                    value={u.status}
                    onChange={(e) =>
                      updateUserStatus(u.id, e.target.value as AppUserStatus)
                    }
                    className={`bg-slate-950 border rounded px-2 py-1 text-xs ${
                      u.status === "active"
                        ? "border-emerald-600 text-emerald-300"
                        : "border-amber-500 text-amber-300"
                    }`}
                    disabled={saving}
                  >
                    <option value="active">active</option>
                    <option value="disabled">disabled</option>
                  </select>
                </td>

                <td className="px-3 py-2 text-slate-400">
                  {u.created_at
                    ? new Date(u.created_at).toLocaleString()
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Invite modal */}
      {inviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold">Invite new user</h2>

            <form className="space-y-3" onSubmit={handleInviteSubmit}>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={inviteUsername}
                  onChange={(e) => setInviteUsername(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) =>
                    setInviteRole(e.target.value as AppUserRole)
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm"
                >
                  <option value="user">user</option>
                  <option value="editor">editor</option>
                  <option value="admin">admin</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setInviteOpen(false)}
                  className="px-3 py-1.5 rounded border border-slate-700 text-xs text-slate-200"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-600 text-xs font-semibold text-white disabled:opacity-50"
                  disabled={saving}
                >
                  {saving ? "Sending..." : "Send invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}