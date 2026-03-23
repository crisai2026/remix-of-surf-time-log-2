import { Palette, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useVisualTheme, type VisualTheme } from "@/hooks/useVisualTheme";

const themes: { id: VisualTheme; name: string; swatches: string[] }[] = [
  { id: "claude", name: "Claude", swatches: ["hsl(16,65%,60%)", "hsl(40,20%,97%)", "hsl(24,10%,10%)"] },
  { id: "nostromo", name: "Nostromo", swatches: ["#C49A5C", "#0A0A0C", "#5A9AAE"] },
  { id: "macintosh", name: "Macintosh '84", swatches: ["#000000", "#FFFFFF", "#C0C0C0"] },
  { id: "vaporwave", name: "Vaporwave", swatches: ["#FF71CE", "#1A1028", "#01CDFE"] },
  { id: "matrix", name: "Matrix", swatches: ["#00FF41", "#000000", "#008F11"] },
];

export function ThemeSelector() {
  const { visualTheme, setVisualTheme } = useVisualTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
          title="Cambiar tema"
        >
          <Palette className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {themes.map((t) => (
          <DropdownMenuItem
            key={t.id}
            onClick={() => setVisualTheme(t.id)}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="flex gap-1">
              {t.swatches.map((c, i) => (
                <div
                  key={i}
                  className="w-3.5 h-3.5 rounded-full"
                  style={{ backgroundColor: c, border: "1px solid rgba(128,128,128,0.3)" }}
                />
              ))}
            </div>
            <span className="flex-1 text-sm">{t.name}</span>
            {visualTheme === t.id && <Check className="h-3.5 w-3.5 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
