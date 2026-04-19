import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Task, Tag } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TagInput } from "./TagInput";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tags: Tag[];
  initial?: Task;
  onSave: (data: Omit<Task, "id" | "createdAt" | "completed">) => void;
  /** Create a tag inline from the task dialog. Returns the created tag (with id). */
  onCreateTag: (name: string, color: string) => Tag;
}

export function TaskDialog({ open, onOpenChange, tags, initial, onSave, onCreateTag }: TaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [tagIds, setTagIds] = useState<string[]>([]);

  // Reset form whenever the dialog opens (for create or edit)
  useEffect(() => {
    if (open) {
      setTitle(initial?.title ?? "");
      setDescription(initial?.description ?? "");
      setDate(initial?.date ?? "");
      setTagIds(initial?.tagIds ?? []);
    }
  }, [open, initial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      date: date || undefined,
      tagIds,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-lg"
        hideClose
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader className="flex flex-row items-center justify-between gap-3 space-y-0 text-left">
            <DialogTitle className="font-display text-2xl flex-1 min-w-0 leading-tight">
              {initial ? "Editar tarefa" : "Nova tarefa"}
            </DialogTitle>
            <div className="flex shrink-0 gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-11 w-11 shrink-0 text-xl"
                onClick={() => onOpenChange(false)}
                aria-label="Cancelar"
              >
                ❌
              </Button>
              <Button
                type="submit"
                size="icon"
                className="h-11 w-11 shrink-0 border-0 bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
                aria-label={initial ? "Salvar alterações" : "Confirmar e criar tarefa"}
              >
                <Check className="h-5 w-5" strokeWidth={2.5} aria-hidden />
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="task-title">Título</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="O que precisa ser feito?"
              autoFocus
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-tags">Tags</Label>
            <TagInput
              allTags={tags}
              selectedIds={tagIds}
              onChange={setTagIds}
              onCreateTag={onCreateTag}
            />
            <p className="text-xs text-muted-foreground">
              Digite para buscar. Pressione Enter para adicionar — ou criar uma nova.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-desc">Descrição (opcional)</Label>
            <Textarea
              id="task-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Adicione detalhes…"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-date">Data (opcional)</Label>
            <Input
              id="task-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
