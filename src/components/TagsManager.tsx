import { useMemo, useState } from "react";
import { Tag, IMPORTANT_TAG_ID } from "@/lib/types";
import { compareTagsImportantFirstThenName } from "@/lib/sort-tags";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Plus, Tag as TagIcon, Pencil, Trash2 } from "lucide-react";
import { TagEditor } from "./TagEditor";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TagsManagerProps {
  tags: Tag[];
  onCreate: (data: Omit<Tag, "id">) => void;
  onUpdate: (id: string, data: Omit<Tag, "id">) => void;
  onDelete: (id: string) => void;
}

export function TagsManager({ tags, onCreate, onUpdate, onDelete }: TagsManagerProps) {
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const sortedTags = useMemo(() => [...tags].sort(compareTagsImportantFirstThenName), [tags]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <TagIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Gerenciar tags</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl">Tags</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-3">
          {sortedTags.map((tag) =>
            editingId === tag.id ? (
              <div key={tag.id} className="rounded-xl border bg-card p-4 animate-scale-in">
                <TagEditor
                  tag={tag}
                  submitLabel="Atualizar"
                  onCancel={() => setEditingId(null)}
                  onSave={(data) => {
                    onUpdate(tag.id, data);
                    setEditingId(null);
                  }}
                />
              </div>
            ) : (
              <div
                key={tag.id}
                className="flex items-center justify-between rounded-xl border bg-card p-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="h-5 w-5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: `hsl(${tag.color})` }}
                  />
                  <span className="font-medium truncate">{tag.name}</span>
                  {tag.id === IMPORTANT_TAG_ID && (
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      Padrão
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => setEditingId(tag.id)}
                    aria-label="Editar tag"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {tag.id !== IMPORTANT_TAG_ID && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          aria-label="Excluir tag"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir tag "{tag.name}"?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Ela será removida de todas as tarefas. Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(tag.id)}>
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            )
          )}

          {creating ? (
            <div className="rounded-xl border bg-card p-4 animate-scale-in">
              <TagEditor
                submitLabel="Criar"
                onCancel={() => setCreating(false)}
                onSave={(data) => {
                  onCreate(data);
                  setCreating(false);
                }}
              />
            </div>
          ) : (
            <Button variant="outline" className="w-full gap-2" onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" />
              Nova tag
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
