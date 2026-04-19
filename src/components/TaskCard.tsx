import { Task, Tag, IMPORTANT_TAG_ID } from "@/lib/types";
import { TagPill } from "./TagEditor";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Pencil, Trash2 } from "lucide-react";
import { format, parseISO, isToday, isTomorrow, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TaskCardProps {
  task: Task;
  tags: Tag[];
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function formatDate(iso: string) {
  const d = parseISO(iso);
  if (isToday(d)) return "Hoje";
  if (isTomorrow(d)) return "Amanhã";
  return format(d, "d 'de' MMM", { locale: ptBR });
}

export function TaskCard({ task, tags, onToggle, onEdit, onDelete }: TaskCardProps) {
  const taskTags = tags.filter((t) => task.tagIds.includes(t.id));
  const isImportant = task.tagIds.includes(IMPORTANT_TAG_ID);

  // Important tasks get the colored backdrop / border treatment.
  const cardClasses = [
    "group relative rounded-2xl border p-4 sm:p-5 transition-all duration-300",
    "animate-fade-in-up shadow-card hover:shadow-elevated",
    isImportant
      ? "bg-[hsl(var(--important-bg))] border-[hsl(var(--important-border))] border-l-4"
      : "bg-card border-border hover:border-foreground/10",
    task.completed && "opacity-60",
  ]
    .filter(Boolean)
    .join(" ");

  const overdue = task.date && !task.completed && isPast(parseISO(task.date)) && !isToday(parseISO(task.date));

  return (
    <article className={cardClasses}>
      <div className="flex items-start gap-3">
        <Checkbox
          checked={task.completed}
          onCheckedChange={onToggle}
          className="mt-1 h-5 w-5 rounded-md"
          aria-label={task.completed ? "Marcar como pendente" : "Marcar como concluída"}
        />

        <div className="flex-1 min-w-0">
          <h3
            className={`font-display font-semibold text-base sm:text-lg leading-tight ${
              task.completed ? "line-through" : ""
            }`}
          >
            {task.title}
          </h3>

          {task.description && (
            <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap break-words">
              {task.description}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {task.date && (
              <span
                className={`inline-flex items-center gap-1 text-xs font-medium ${
                  overdue ? "text-destructive" : "text-muted-foreground"
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(task.date)}
              </span>
            )}
            {taskTags.map((t) => (
              <TagPill key={t.id} tag={t} />
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-1 opacity-60 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onEdit} aria-label="Editar tarefa">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={onDelete}
            aria-label="Excluir tarefa"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </article>
  );
}
