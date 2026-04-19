import { Tag, TAG_PALETTE } from "@/lib/types";
import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";

interface TagEditorProps {
  tag?: Tag;
  onSave: (data: Omit<Tag, "id">) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

/** Inline editor used for both creating and editing a tag */
export function TagEditor({ tag, onSave, onCancel, submitLabel = "Salvar" }: TagEditorProps) {
  const [name, setName] = useState(tag?.name ?? "");
  const [color, setColor] = useState(tag?.color ?? TAG_PALETTE[1]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave({ name: trimmed, color });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="tag-name">Nome da tag</Label>
        <Input
          id="tag-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Trabalho"
          autoFocus
          maxLength={24}
        />
      </div>

      <div className="space-y-2">
        <Label>Cor</Label>
        <div className="flex flex-wrap gap-2">
          {TAG_PALETTE.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="h-8 w-8 rounded-full ring-offset-2 ring-offset-background transition-transform hover:scale-110 flex items-center justify-center"
              style={{ backgroundColor: `hsl(${c})` }}
              aria-label={`Selecionar cor ${c}`}
            >
              {color === c && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={!name.trim()}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

interface TagPillProps {
  tag: Tag;
  selected?: boolean;
  onClick?: () => void;
  size?: "sm" | "md";
}

/** Colored pill used in cards and filters */
export function TagPill({ tag, selected, onClick, size = "sm" }: TagPillProps) {
  const interactive = !!onClick;
  const baseStyle: React.CSSProperties = selected
    ? { backgroundColor: `hsl(${tag.color})`, color: "white", borderColor: `hsl(${tag.color})` }
    : { color: `hsl(${tag.color})`, borderColor: `hsl(${tag.color} / 0.4)`, backgroundColor: `hsl(${tag.color} / 0.08)` };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!interactive}
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium transition-all ${
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm"
      } ${interactive ? "hover:scale-[1.03] cursor-pointer" : "cursor-default"}`}
      style={baseStyle}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: selected ? "white" : `hsl(${tag.color})` }}
      />
      {tag.name}
    </button>
  );
}
