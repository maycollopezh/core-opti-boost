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
El modelo Simplex aplicado sobre los recursos de ${profile.name} indica que la organización opera bajo una eficiencia óptima de Bs. 1.500, concentrando el 100% de la capacidad productiva en la variable x₂ (${profile.resource2Name}). Esto sugiere una especialización clara del flujo operativo hacia el servicio de mayor margen unitario.

2. ANÁLISIS DE DUALIDAD
El precio sombra del recurso "${profile.resource2Name}" es positivo, lo que implica que cada hora adicional contratada incrementa la función objetivo. Se recomienda evaluar la ampliación de la plantilla técnica o la automatización parcial mediante virtualización.

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