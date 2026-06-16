import { cn } from "@/lib/utils";
import { Activity, Building2, Truck, Sparkles, Cpu } from "lucide-react";

export type SectionId = "profile" | "simplex" | "transport" | "ai";

const items: { id: SectionId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "profile", label: "Perfil de Empresa", icon: Building2 },
  { id: "simplex", label: "Optimización (Simplex)", icon: Activity },
  { id: "transport", label: "Distribución Logística", icon: Truck },
  { id: "ai", label: "Consultor Estratégico AI", icon: Sparkles },
];

export function OptiSidebar({
  active,
  onSelect,
}: {
  active: SectionId;
  onSelect: (s: SectionId) => void;
}) {
  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 px-5 py-6 border-b border-sidebar-border">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30">
          <Cpu className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <div className="text-base font-bold tracking-tight">OptiCore AI</div>
          <div className="text-xs text-muted-foreground">Decision Intelligence</div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map((it) => {
          const Icon = it.icon;
          const isActive = active === it.id;
          return (
            <button
              key={it.id}
              onClick={() => onSelect(it.id)}
              className={cn(
                "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm ring-1 ring-primary/30"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 transition-colors",
                  isActive ? "text-primary" : "text-sidebar-foreground/60 group-hover:text-primary",
                )}
              />
              <span className="font-medium">{it.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="px-5 py-4 border-t border-sidebar-border">
        <div className="rounded-lg bg-gradient-to-br from-primary/15 to-accent/10 p-3 border border-primary/20">
          <div className="text-xs font-semibold text-primary">Investigación Operativa</div>
          <div className="text-[11px] text-muted-foreground mt-1">
            Simplex, Dualidad y Transporte en Bolivianos (Bs.)
          </div>
        </div>
      </div>
    </aside>
  );
}