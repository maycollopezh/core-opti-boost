import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OptiProvider, useOpti } from "@/lib/opticore-context";
import { OptiSidebar, type SectionId } from "@/components/opticore/Sidebar";
import { ProfileSection } from "@/components/opticore/ProfileSection";
import { SimplexSection } from "@/components/opticore/SimplexSection";
import { TransportSection } from "@/components/opticore/TransportSection";
import { AISection } from "@/components/opticore/AISection";
import { ChatWidget } from "@/components/opticore/ChatWidget";
import { saveSimulation, isSupabaseConfigured } from "@/lib/supabaseClient";
import { Save, Cpu, Activity, Building2, Truck, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OptiCore AI · Decision Intelligence" },
      {
        name: "description",
        content:
          "Plataforma SaaS de Investigación Operativa: optimiza recursos (Simplex), distribución (Transporte) y genera reportes gerenciales con IA en Bolivianos.",
      },
      { property: "og:title", content: "OptiCore AI · Decision Intelligence" },
      {
        property: "og:description",
        content: "Sistema de Soporte a la Toma de Decisiones con Simplex, Dualidad y Modelo de Transporte.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <OptiProvider>
      <Shell />
      <Toaster richColors position="top-right" theme="dark" />
    </OptiProvider>
  );
}

function Shell() {
  const [section, setSection] = useState<SectionId>("profile");
  const { profile, simplex, transport, report } = useOpti();

  const handleSave = async () => {
    const t = toast.loading("Guardando simulación en Lovable Cloud...");
    try {
      const res = await saveSimulation({
        company_name: profile.name,
        industry: profile.industry,
        inputs: { simplex, transport: { supplies: transport.supplies, demands: transport.demands, costs: transport.costs } },
        results: { optimalCost: transport.optimalCost, assignment: transport.assignment },
        report,
      });
      toast.dismiss(t);
      toast.success("Simulación guardada", {
        description: res.demo
          ? "Modo demo activo · Configura supabaseClient.ts para persistir en la nube"
          : "Registro insertado en la tabla `simulations`",
      });
    } catch (e: unknown) {
      toast.dismiss(t);
      toast.error("Error al guardar", { description: e instanceof Error ? e.message : "Intenta nuevamente" });
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-background via-background to-sidebar">
      <OptiSidebar active={section} onSelect={setSection} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
          <div className="flex flex-wrap items-center gap-4 px-6 py-4">
            <div className="md:hidden flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                <Cpu className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold">OptiCore AI</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Workspace</span>
                <span>/</span>
                <span className="text-primary">{sectionLabel(section)}</span>
              </div>
              <h1 className="truncate text-xl font-bold tracking-tight">
                {profile.name}{" "}
                <span className="text-muted-foreground font-normal">· {profile.industry}</span>
              </h1>
            </div>
            <Badge variant="outline" className="border-primary/40 text-primary">
              {isSupabaseConfigured ? "Cloud Conectado" : "Modo Demo"}
            </Badge>
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/30 hover:opacity-90"
            >
              <Save className="mr-2 h-4 w-4" />
              Guardar Simulación
            </Button>
          </div>
          <MobileTabs active={section} onSelect={setSection} />
        </header>

        <main className="flex-1 px-4 md:px-6 py-6">
          <div className="mx-auto max-w-7xl space-y-6">
            {section === "profile" && <ProfileSection />}
            {section === "simplex" && <SimplexSection />}
            {section === "transport" && <TransportSection />}
            {section === "ai" && <AISection />}
          </div>
        </main>
      </div>
      <ChatWidget />
    </div>
  );
}

function sectionLabel(s: SectionId) {
  return s === "profile"
    ? "Perfil de Empresa"
    : s === "simplex"
      ? "Optimización Simplex"
      : s === "transport"
        ? "Distribución Logística"
        : "Consultor AI";
}

function MobileTabs({ active, onSelect }: { active: SectionId; onSelect: (s: SectionId) => void }) {
  const items: { id: SectionId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "profile", label: "Perfil", icon: Building2 },
    { id: "simplex", label: "Simplex", icon: Activity },
    { id: "transport", label: "Transporte", icon: Truck },
    { id: "ai", label: "AI", icon: Sparkles },
  ];
  return (
    <div className="md:hidden flex gap-1 overflow-x-auto px-4 pb-3">
      {items.map((it) => {
        const Icon = it.icon;
        const a = active === it.id;
        return (
          <button
            key={it.id}
            onClick={() => onSelect(it.id)}
            className={
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs whitespace-nowrap " +
              (a ? "bg-primary text-primary-foreground" : "bg-muted/40 text-muted-foreground")
            }
          >
            <Icon className="h-3.5 w-3.5" />
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
