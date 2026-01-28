import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronRight, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  availableModules, 
  getModulesByCategory, 
  iconMap, 
  ModuleCategory,
  ReportModule 
} from "@/data/mockReports";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const categories: { id: ModuleCategory; label: string }[] = [
  { id: "financial", label: "Financial Metrics" },
  { id: "departmental", label: "Departmental" },
  { id: "visualizations", label: "Visualizations" },
];

interface DraggableModuleProps {
  module: ReportModule;
}

function DraggableModule({ module }: DraggableModuleProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: module.id,
    data: { type: "module", moduleId: module.id },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const IconComponent = iconMap[module.icon];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border border-border bg-card cursor-grab transition-all",
        "hover:border-accent hover:shadow-sm",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      {IconComponent && <IconComponent className="h-4 w-4 text-accent flex-shrink-0" />}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground truncate">{module.name}</p>
        <p className="text-xs text-muted-foreground truncate">{module.description}</p>
      </div>
    </div>
  );
}

export function ModuleSidebar() {
  const [openCategories, setOpenCategories] = useState<ModuleCategory[]>(["financial"]);

  const toggleCategory = (category: ModuleCategory) => {
    setOpenCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  return (
    <aside className="w-72 flex-shrink-0 border-r border-border bg-muted/30 overflow-y-auto">
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Data Modules</h2>
        <p className="text-xs text-muted-foreground">Drag to add to report</p>
      </div>

      <div className="p-2 space-y-2">
        {categories.map((category) => {
          const isOpen = openCategories.includes(category.id);
          const modules = getModulesByCategory(category.id);

          return (
            <Collapsible
              key={category.id}
              open={isOpen}
              onOpenChange={() => toggleCategory(category.id)}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-foreground rounded-lg hover:bg-muted transition-colors">
                <span>{category.label}</span>
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-2 px-1">
                {modules.map((module) => (
                  <DraggableModule key={module.id} module={module} />
                ))}
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    </aside>
  );
}
