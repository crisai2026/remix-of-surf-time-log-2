import { useTags } from "@/lib/hooks/useTags";

interface TagSelectorProps {
  selected: string[];
  onChange: (ids: string[]) => void;
}

export function TagSelector({ selected, onChange }: TagSelectorProps) {
  const { data: tags } = useTags();

  if (!tags || tags.length === 0) return null;

  const toggle = (id: string) => {
    onChange(
      selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tags.map((t) => {
        const active = selected.includes(t.id);
        return (
          <button
            key={t.id}
            onClick={() => toggle(t.id)}
            className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border transition-colors ${
              active
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:border-primary/40"
            }`}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: active ? "currentColor" : t.color }}
            />
            {t.name}
          </button>
        );
      })}
    </div>
  );
}
