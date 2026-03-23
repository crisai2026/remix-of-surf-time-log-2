import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

const options = [
  { value: "light" as const, icon: Sun, label: "Claro" },
  { value: "system" as const, icon: Monitor, label: "Sistema" },
  { value: "dark" as const, icon: Moon, label: "Oscuro" },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-0.5 bg-secondary rounded-lg p-0.5">
      {options.map(({ value, icon: Icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`p-1.5 rounded-md transition-all ${
            theme === value
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
          title={value === "light" ? "Claro" : value === "dark" ? "Oscuro" : "Sistema"}
        >
          <Icon className="h-3 w-3" />
        </button>
      ))}
    </div>
  );
}
