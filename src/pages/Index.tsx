import { useEffect, useMemo, useState } from "react";
import { Plus, Moon, Sun, Sparkles, Star, ListTodo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useTheme } from "@/hooks/use-theme";
import { Task, Tag, DEFAULT_TAGS, IMPORTANT_TAG_ID } from "@/lib/types";
import { TaskCard } from "@/components/TaskCard";
import { TaskDialog } from "@/components/TaskDialog";
import { TagsManager } from "@/components/TagsManager";
import { TagPill } from "@/components/TagEditor";
import { toast } from "sonner";

type Filter = "all" | "important" | string; // string = tag id

const Index = () => {
  const { theme, toggle } = useTheme();
  const [tasks, setTasks] = useLocalStorage<Task[]>("tasks.v1", []);
  const [tags, setTags] = useLocalStorage<Tag[]>("tags.v1", DEFAULT_TAGS);
  // IDs of tags created inline from the task dialog — these auto-delete when no
  // task references them. Tags created via the Tags Manager are kept around even
  // if unused, since the user explicitly created them.
  const [inlineTagIds, setInlineTagIds] = useLocalStorage<string[]>("tags.inline.v1", []);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Task | undefined>();

  // ---- Tag CRUD ------------------------------------------------------------
  const createTag = (data: Omit<Tag, "id">) => {
    setTags((prev) => [...prev, { ...data, id: `tag-${Date.now()}` }]);
    toast.success("Tag criada");
  };
  /** Inline creation from the task dialog: returns the new Tag synchronously. */
  const createTagInline = (name: string, color: string): Tag => {
    const tag: Tag = { id: `tag-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, name, color };
    setTags((prev) => [...prev, tag]);
    setInlineTagIds((prev) => [...prev, tag.id]);
    return tag;
  };
  const updateTag = (id: string, data: Omit<Tag, "id">) => {
    setTags((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
    // If the user explicitly edited an inline tag, treat it as "owned" — stop auto-deleting it.
    setInlineTagIds((prev) => prev.filter((x) => x !== id));
  };
  const deleteTag = (id: string) => {
    setTags((prev) => prev.filter((t) => t.id !== id));
    setTasks((prev) => prev.map((t) => ({ ...t, tagIds: t.tagIds.filter((x) => x !== id) })));
    setInlineTagIds((prev) => prev.filter((x) => x !== id));
    if (filter === id) setFilter("all");
    toast.success("Tag excluída");
  };

  // ---- Auto-prune orphan inline tags --------------------------------------
  // Whenever tasks change, drop any inline-created tag that is no longer used
  // by any task. Manually-created tags and the default "Importante" are kept.
  useEffect(() => {
    if (inlineTagIds.length === 0) return;
    const usedIds = new Set(tasks.flatMap((t) => t.tagIds));
    const orphans = inlineTagIds.filter((id) => !usedIds.has(id));
    if (orphans.length === 0) return;
    setTags((prev) => prev.filter((t) => !orphans.includes(t.id)));
    setInlineTagIds((prev) => prev.filter((id) => !orphans.includes(id)));
    if (orphans.includes(filter as string)) setFilter("all");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks]);

  // ---- Task CRUD -----------------------------------------------------------
  const saveTask = (data: Omit<Task, "id" | "createdAt" | "completed">) => {
    if (editing) {
      setTasks((prev) => prev.map((t) => (t.id === editing.id ? { ...t, ...data } : t)));
      toast.success("Tarefa atualizada");
    } else {
      setTasks((prev) => [
        { ...data, id: `task-${Date.now()}`, createdAt: Date.now(), completed: false },
        ...prev,
      ]);
      toast.success("Tarefa criada");
    }
    setEditing(undefined);
  };
  const toggleTask = (id: string) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    toast.success("Tarefa excluída");
  };

  // ---- Filtering -----------------------------------------------------------
  const filtered = useMemo(() => {
    let list = tasks;
    if (filter === "important") list = list.filter((t) => t.tagIds.includes(IMPORTANT_TAG_ID));
    else if (filter !== "all") list = list.filter((t) => t.tagIds.includes(filter));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)
      );
    }
    // Sort: incomplete first, then by createdAt desc
    return [...list].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return b.createdAt - a.createdAt;
    });
  }, [tasks, filter, search]);

  const importantCount = tasks.filter((t) => t.tagIds.includes(IMPORTANT_TAG_ID) && !t.completed).length;
  const totalActive = tasks.filter((t) => !t.completed).length;

  const importantTag = tags.find((t) => t.id === IMPORTANT_TAG_ID);
  const customTags = tags.filter((t) => t.id !== IMPORTANT_TAG_ID);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/70 border-b border-border">
        <div className="container max-w-3xl flex items-center justify-between gap-3 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="font-display font-bold text-xl sm:text-2xl leading-none">Tarefas</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {totalActive} ativa{totalActive === 1 ? "" : "s"}
                {importantCount > 0 && ` • ${importantCount} importante${importantCount === 1 ? "" : "s"}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TagsManager tags={tags} onCreate={createTag} onUpdate={updateTag} onDelete={deleteTag} />
            <Button
              size="icon"
              variant="ghost"
              onClick={toggle}
              aria-label="Alternar tema"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-3xl py-6 sm:py-8 space-y-6">
        {/* Search + new */}
        <div className="flex gap-2">
          <Input
            placeholder="Buscar tarefas…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11"
          />
          <Button
            size="lg"
            className="gap-2 shadow-glow bg-gradient-primary hover:opacity-90"
            onClick={() => {
              setEditing(undefined);
              setDialogOpen(true);
            }}
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Nova</span>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            className="gap-1.5 rounded-full"
          >
            <ListTodo className="h-3.5 w-3.5" />
            Todas
          </Button>
          {importantTag && (
            <Button
              size="sm"
              variant={filter === "important" ? "default" : "outline"}
              onClick={() => setFilter("important")}
              className="gap-1.5 rounded-full"
              style={
                filter === "important"
                  ? { backgroundColor: `hsl(${importantTag.color})`, borderColor: `hsl(${importantTag.color})` }
                  : undefined
              }
            >
              <Star className="h-3.5 w-3.5" />
              Importantes
            </Button>
          )}
          {customTags.map((tag) => (
            <TagPill
              key={tag.id}
              tag={tag}
              selected={filter === tag.id}
              onClick={() => setFilter(filter === tag.id ? "all" : tag.id)}
              size="md"
            />
          ))}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 px-4 rounded-2xl border-2 border-dashed border-border">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mb-4">
              <ListTodo className="h-7 w-7 text-muted-foreground" />
            </div>
            <h2 className="font-display font-semibold text-lg">
              {tasks.length === 0 ? "Comece criando sua primeira tarefa" : "Nada por aqui"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {tasks.length === 0
                ? "Organize seu dia e destaque o que é importante."
                : "Tente outro filtro ou termo de busca."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                tags={tags}
                onToggle={() => toggleTask(task.id)}
                onEdit={() => {
                  setEditing(task);
                  setDialogOpen(true);
                }}
                onDelete={() => deleteTask(task.id)}
              />
            ))}
          </div>
        )}
      </main>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) setEditing(undefined);
        }}
        tags={tags}
        initial={editing}
        onSave={saveTask}
        onCreateTag={createTagInline}
      />
    </div>
  );
};

export default Index;
