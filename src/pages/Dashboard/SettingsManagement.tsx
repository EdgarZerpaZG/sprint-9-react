import { useEffect, useState } from "react";
import { useSiteSettings } from "../../hooks/useSiteSettings";
import LogoUploader from "../../components/settings/LogoUploader";

export default function SettingsManagement() {
  const { settings, loading, error, updateSettings } = useSiteSettings();
  const [titleInput, setTitleInput] = useState("ManagementZG");
  const [showCalendar, setShowCalendar] = useState<boolean>(true);
  const [logoInput, setLogoInput] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setTitleInput(settings.manager_title || "ManagementZG");
      setShowCalendar(
        settings.show_calendar !== null &&
          settings.show_calendar !== undefined
          ? settings.show_calendar
          : true
      );
      setLogoInput(settings.logo_url || "");
    } else {
      setTitleInput("ManagementZG");
      setShowCalendar(true);
      setLogoInput("");
    }
  }, [settings]);

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading settings...</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setLocalError(null);
    setSaved(false);

    try {
      await updateSettings({
        managerTitle: titleInput,
        showCalendar,
        logoUrl: logoInput,
      });
      setSaved(true);
    } catch (err: any) {
      setLocalError(err?.message ?? "Error saving settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-slate-400">
          Global configuration for your CMS and public site.
        </p>
      </header>

      {(error || localError) && (
        <div className="rounded bg-red-500/10 border border-red-500/40 px-3 py-2 text-sm text-red-200">
          {localError ?? error}
        </div>
      )}

      {saved && !localError && (
        <div className="rounded bg-emerald-500/10 border border-emerald-500/40 px-3 py-2 text-sm text-emerald-200">
          Settings saved successfully.
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-lg bg-slate-900/60 border border-slate-800 p-4"
      >
        {/* Title */}
        <div>
          <label
            htmlFor="settings-title"
            className="block text-xs font-semibold uppercase text-slate-400 mb-1"
          >
            Dashboard / site title
          </label>
          <input
            id="settings-title"
            type="text"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            className="w-full rounded bg-slate-950 border border-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="ManagementZG"
          />
          <p className="mt-1 text-xs text-slate-500">
            This title is shown in the dashboard and next to the logo in the public navbar.
          </p>
        </div>

        {/* Logo uploader */}
        <div className="pt-3 border-t border-slate-800">
          <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">
            Logo image
          </label>

          <LogoUploader
            value={logoInput}
            onChange={(url) => setLogoInput(url)}
          />
        </div>

        {/* Calendar toggle */}
        <div className="pt-3 mt-3 border-t border-slate-800 space-y-1">
          <label className="flex items-center gap-2 text-sm text-slate-100 cursor-pointer">
            <input
              type="checkbox"
              checked={showCalendar}
              onChange={(e) => setShowCalendar(e.target.checked)}
              className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
            />
            <span>Enable public calendar in navbar</span>
          </label>
          <p className="text-xs text-slate-500">
            When enabled, a &quot;Calendar&quot; link is shown in the main navigation.
          </p>
        </div>

        {/* Save */}
        <div className="flex items-center gap-2 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-sm font-medium"
          >
            {saving ? "Saving..." : "Save settings"}
          </button>
        </div>
      </form>
    </div>
  );
}