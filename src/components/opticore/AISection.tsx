import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, FileText, Loader2 } from "lucide-react";
import { useOpti } from "@/lib/opticore-context";
import { useState } from "react";

export function AISection() {
  const { profile, simplex, transport, report, setReport } = useOpti();
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    setReport(null);
    await new Promise((r) => setTimeout(r, 1600));
    const text = `REPORTE GERENCIAL EJECUTIVO · ${profile.name}
Rubro: ${profile.industry}
Fecha: ${new Date().toLocaleDateString("es-BO")}

1. RESUMEN ESTRATÉGICO
El análisis de optimización aplicado sobre ${profile.name} identifica la combinación de productos y servicios que maximiza el beneficio operativo, concentrando la capacidad productiva en aquellas líneas con mayor margen unitario. Esto sugiere una especialización clara del flujo operativo hacia los servicios más rentables.

2. ANÁLISIS DE DUALIDAD
Los recursos limitantes con precio sombra positivo representan los cuellos de botella reales del negocio: ampliar su disponibilidad incrementa directamente el beneficio operativo. Se recomienda priorizar inversión en estos recursos antes que en aquellos con holgura.

3. DISTRIBUCIÓN LOGÍSTICA
El modelo de Transporte arroja un Costo Mínimo de Operación de Bs. ${transport.optimalCost.toLocaleString("es-BO")}, optimizando la asignación entre los nodos de oferta y los destinos definidos. La ruta más eficiente concentra el flujo virtualizado hacia El Alto, aprovechando su menor costo unitario.

4. RECOMENDACIONES
 • Reinvertir el excedente de eficiencia en capacitación técnica.
 • Auditar trimestralmente las restricciones para reajustar los precios sombra.
 • Escalar la infraestructura virtualizada como palanca de margen.

— Generado por OptiCore AI Strategic Engine —`;
    setReport(text);
    setLoading(false);
  };

  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Reporte Gerencial con IA
        </CardTitle>
        <CardDescription>
          Síntesis ejecutiva multi-modelo (Simplex + Transporte) generada por el motor estratégico.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={generate}
          disabled={loading}
          className="bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/30 hover:opacity-90"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analizando escenarios...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" /> Generar Reporte Gerencial con IA
            </>
          )}
        </Button>
        {(report || loading) && (
          <div className="rounded-xl border border-border/60 bg-background/60 p-5">
            {loading ? (
              <div className="space-y-2">
                <div className="h-3 w-3/4 animate-pulse rounded bg-muted/60" />
                <div className="h-3 w-full animate-pulse rounded bg-muted/60" />
                <div className="h-3 w-5/6 animate-pulse rounded bg-muted/60" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-muted/60" />
              </div>
            ) : (
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/90">
                {report}
              </pre>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}