import { Palette, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useVisualTheme, type VisualTheme } from "@/hooks/useVisualTheme";

const themes: { id: VisualTheme; label: string }[] = [
  { id: "claude", label: "Claude Edition" },
  { id: "nostromo", label: "Nostromo Edition" },
  { id: "macintosh", label: "Mac '84 Edition" },
  { id: "vaporwave", label: "Vaporwave Edition" },
  { id: "matrix", label: "Matrix Edition" },
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
      <DropdownMenuContent align="end" className="w-48">
        {themes.map((t) => (
          <DropdownMenuItem
            key={t.id}
            onClick={() => setVisualTheme(t.id)}
            className="flex items-center justify-between cursor-pointer"
          >
            <span className="text-sm font-medium">{t.label}</span>
            {visualTheme === t.id && <Check className="h-3.5 w-3.5 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
