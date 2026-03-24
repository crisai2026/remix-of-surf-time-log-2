import { Bell, BellOff } from "lucide-react";
import { useNotificationSettings, useNotificationReminder, requestPermission } from "@/hooks/useNotifications";
import { useState } from "react";

const INTERVAL_OPTIONS = [1, 2, 3, 4];

export function NotificationSettings() {
  const { settings, setSettings } = useNotificationSettings();
  const [showMenu, setShowMenu] = useState(false);

  useNotificationReminder(settings);

  const handleToggle = async () => {
    if (!settings.enabled) {
      const granted = await requestPermission();
      if (!granted) return;
      setSettings({ enabled: true });
    } else {
      setSettings({ enabled: false });
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
        title="Notifications"
      >
        {settings.enabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 top-full mt-2 z-30 bg-card border border-border rounded-lg shadow-lg p-4 w-56 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Reminders</span>
              <button
                onClick={handleToggle}
                className={`relative w-9 h-5 rounded-full transition-colors ${
                  settings.enabled ? "bg-primary" : "bg-secondary"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.enabled ? "translate-x-4" : ""
                  }`}
                />
              </button>
            </div>

            {settings.enabled && (
              <div className="space-y-2">
                <span className="text-xs text-muted-foreground">Alert if no entry in:</span>
                <div className="flex gap-1.5">
                  {INTERVAL_OPTIONS.map((h) => (
                    <button
                      key={h}
                      onClick={() => setSettings({ intervalHours: h })}
                      className={`text-xs px-2.5 py-1 rounded-md transition-all ${
                        settings.intervalHours === h
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {h}h
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
