import { useEffect, useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "marea_notification_settings";

interface NotificationSettings {
  enabled: boolean;
  intervalHours: number;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  intervalHours: 2,
};

function loadSettings(): NotificationSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_SETTINGS;
}

function saveSettings(s: NotificationSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export function useNotificationSettings() {
  const [settings, setSettingsState] = useState<NotificationSettings>(loadSettings);

  const setSettings = useCallback((update: Partial<NotificationSettings>) => {
    setSettingsState((prev) => {
      const next = { ...prev, ...update };
      saveSettings(next);
      return next;
    });
  }, []);

  return { settings, setSettings };
}

export function useNotificationReminder(settings: NotificationSettings) {
  const checkAndNotify = useCallback(async () => {
    if (!settings.enabled) return;
    if (Notification.permission !== "granted") return;

    // Check last entry (running or completed)
    const { data } = await supabase
      .from("time_entries")
      .select("start_time, is_running")
      .order("start_time", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data?.is_running) return; // timer is running, no need to remind

    const lastTime = data ? new Date(data.start_time).getTime() : 0;
    const hoursAgo = (Date.now() - lastTime) / (1000 * 60 * 60);

    if (hoursAgo >= settings.intervalHours) {
      new Notification("Marea Timer", {
        body: `Llevas ${Math.floor(hoursAgo)}h sin registrar tiempo. ¡Arrancá el timer!`,
        icon: "/placeholder.svg",
      });
    }
  }, [settings.enabled, settings.intervalHours]);

  useEffect(() => {
    if (!settings.enabled) return;

    // Check immediately on enable
    checkAndNotify();

    // Then check every 15 minutes
    const id = setInterval(checkAndNotify, 15 * 60 * 1000);
    return () => clearInterval(id);
  }, [settings.enabled, checkAndNotify]);
}

export async function requestPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}
