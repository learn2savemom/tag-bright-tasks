import { useMemo, useRef, useState, KeyboardEvent } from "react";
import { Tag, TAG_PALETTE } from "@/lib/types";
import { TagPill } from "./TagEditor";
import { Plus, X } from "lucide-react";

interface TagInputProps {
  allTags: Tag[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  /** Called when the user creates a brand new tag inline. Must return the new tag (with id). */
  onCreateTag: (name: string, color: string) => Tag;
}

/**
 * Combobox-like field: type to search existing tags, press Enter (or click)
 * to attach. If no tag matches, Enter creates a new one with an auto-picked color.
 */
export function TagInput({ allTags, selectedIds, onChange, onCreateTag }: TagInputProps) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = allTags.filter((t) => selectedIds.includes(t.id));

  // Suggestions: tags matching the query that aren't already selected.
  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    const available = allTags.filter((t) => !selectedIds.includes(t.id));
    if (!q) return available.slice(0, 8);
    return available.filter((t) => t.name.toLowerCase().includes(q)).slice(0, 8);
  }, [query, allTags, selectedIds]);

  const exactMatch = allTags.find((t) => t.name.toLowerCase() === query.trim().toLowerCase());
  const canCreate = query.trim().length > 0 && !exactMatch;

  // Pick a color that isn't already used by an existing tag (cycles through palette).
  const pickNewColor = () => {
    const used = new Set(allTags.map((t) => t.color));
    return TAG_PALETTE.find((c) => !used.has(c)) ?? TAG_PALETTE[Math.floor(Math.random() * TAG_PALETTE.length)];
  };

  const attach = (id: string) => {
    if (!selectedIds.includes(id)) onChange([...selectedIds, id]);
    setQuery("");
    setHighlight(0);
  };

  const detach = (id: string) => onChange(selectedIds.filter((x) => x !== id));

  const handleCreate = () => {
    const name = query.trim();
    if (!name) return;
    const newTag = onCreateTag(name, pickNewColor());
    attach(newTag.id);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const total = suggestions.length + (canCreate ? 1 : 0);

    if (e.key === "Enter") {
      e.preventDefault();
      if (total === 0) return;
      if (canCreate && highlight === suggestions.length) {
        handleCreate();
      } else if (suggestions[highlight]) {
        attach(suggestions[highlight].id);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, Math.max(total - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Backspace" && query === "" && selected.length > 0) {
      // Remove the last selected tag when backspacing on an empty input.
      detach(selected[selected.length - 1].id);
    } else if (e.key === "Escape") {
      setQuery("");
      inputRef.current?.blur();
    }
  };

  const showDropdown = focused && (suggestions.length > 0 || canCreate);

  return (
    <div className="relative">
      <div
        className="flex flex-wrap items-center gap-1.5 min-h-11 rounded-md border border-input bg-background px-2 py-1.5 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background transition-all cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {selected.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium animate-scale-in"
            style={{
              color: `hsl(${tag.color})`,
              borderColor: `hsl(${tag.color} / 0.4)`,
              backgroundColor: `hsl(${tag.color} / 0.1)`,
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: `hsl(${tag.color})` }} />
            {tag.name}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                detach(tag.id);
              }}
              className="ml-0.5 rounded-full hover:bg-foreground/10 p-0.5 transition-colors"
              aria-label={`Remover tag ${tag.name}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setHighlight(0);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          // Delay so click on a suggestion registers before the dropdown closes.
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder={selected.length === 0 ? "Digite para buscar ou criar tags…" : ""}
          className="flex-1 min-w-[140px] bg-transparent outline-none text-sm py-1"
        />
      </div>

      {showDropdown && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 rounded-lg border bg-popover shadow-elevated p-1 max-h-64 overflow-y-auto animate-scale-in">
          {suggestions.map((tag, i) => (
            <button
              key={tag.id}
              type="button"
              onMouseEnter={() => setHighlight(i)}
              onClick={() => attach(tag.id)}
              className={`w-full flex items-center gap-2 rounded-md px-2 py-2 text-sm text-left transition-colors ${
                highlight === i ? "bg-accent" : "hover:bg-accent/60"
              }`}
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: `hsl(${tag.color})` }} />
              <span className="flex-1 truncate">{tag.name}</span>
            </button>
          ))}
          {canCreate && (
            <button
              type="button"
              onMouseEnter={() => setHighlight(suggestions.length)}
              onClick={handleCreate}
              className={`w-full flex items-center gap-2 rounded-md px-2 py-2 text-sm text-left transition-colors ${
                highlight === suggestions.length ? "bg-accent" : "hover:bg-accent/60"
              }`}
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Plus className="h-3 w-3" />
              </span>
              <span className="flex-1 truncate">
                Criar tag <span className="font-semibold">"{query.trim()}"</span>
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Re-export to keep imports tidy where both are used.
export { TagPill };
