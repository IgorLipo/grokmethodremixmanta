import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Settings, Trash2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { CanvasModule, getModuleById, iconMap } from "@/data/mockReports";
import { Button } from "@/components/ui/button";

interface SortableModuleCardProps {
  canvasModule: CanvasModule;
  onConfigure: () => void;
  onRemove: () => void;
}

function SortableModuleCard({ canvasModule, onConfigure, onRemove }: SortableModuleCardProps) {
  const module = getModuleById(canvasModule.moduleId);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: canvasModule.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (!module) return null;

  const IconComponent = iconMap[module.icon];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-start gap-4 p-4 rounded-xl border border-border bg-card transition-all",
        isDragging && "opacity-50 shadow-xl z-50"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="mt-1 cursor-grab touch-none text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {IconComponent && <IconComponent className="h-4 w-4 text-accent" />}
          <h3 className="text-sm font-medium text-foreground">{module.name}</h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {module.type}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{module.description}</p>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onConfigure}
        >
          <Settings className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

interface ReportCanvasProps {
  modules: CanvasModule[];
  onConfigure: (module: CanvasModule) => void;
  onRemove: (canvasId: string) => void;
}

export function ReportCanvas({ modules, onConfigure, onRemove }: ReportCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: "canvas-droppable",
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex-1 p-6 overflow-y-auto transition-colors",
        isOver && "bg-accent/5"
      )}
    >
      {modules.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center border-2 border-dashed border-border rounded-2xl p-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            Start Building Your Report
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Drag modules from the sidebar to add them to your report. 
            Reorder by dragging within the canvas.
          </p>
        </div>
      ) : (
        <SortableContext
          items={modules.map((m) => m.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4 max-w-3xl mx-auto">
            {modules.map((canvasModule) => (
              <SortableModuleCard
                key={canvasModule.id}
                canvasModule={canvasModule}
                onConfigure={() => onConfigure(canvasModule)}
                onRemove={() => onRemove(canvasModule.id)}
              />
            ))}
          </div>
        </SortableContext>
      )}
    </div>
  );
}
