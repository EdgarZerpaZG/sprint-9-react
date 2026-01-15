import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export type SiteSettings = {
  id: string;
  manager_title: string | null;
  show_calendar: boolean | null;
  logo_url: string | null;
};

type SettingsPayload = {
  managerTitle: string;
  showCalendar: boolean;
  logoUrl: string;
};

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .limit(1)
      .maybeSingle<SiteSettings>();

    if (error) {
      console.error("[useSiteSettings] load error:", error);
      setError(error.message);
      setSettings(null);
    } else {
      setSettings(data ?? null);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateSettings(payload: SettingsPayload) {
    setError(null);

    const trimmedTitle =
      payload.managerTitle.trim();
    const showCalendar = !!payload.showCalendar;
    const logoUrl = payload.logoUrl.trim();

    if (!settings) {
      const { data, error } = await supabase
        .from("settings")
        .insert({
          manager_title: trimmedTitle,
          show_calendar: showCalendar,
          logo_url: logoUrl || null,
        })
        .select("*")
        .single<SiteSettings>();

      if (error) {
        console.error("[useSiteSettings] insert error:", error);
        setError(error.message);
        throw error;
      }

      setSettings(data);
      return;
    }

    const { data, error } = await supabase
      .from("settings")
      .update({
        manager_title: trimmedTitle,
        show_calendar: showCalendar,
        logo_url: logoUrl || null,
      })
      .eq("id", settings.id)
      .select("*")
      .single<SiteSettings>();

    if (error) {
      console.error("[useSiteSettings] update error:", error);
      setError(error.message);
      throw error;
    }

    setSettings(data);
  }

  return {
    settings,
    loading,
    error,
    reload: load,
    updateSettings,
  };
}