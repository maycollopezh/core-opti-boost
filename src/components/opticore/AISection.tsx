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
    
    try {
      // 1. Empaquetamos todos los resultados matemáticos (Simplex y Transporte)
      const datosModelo = {
        optimizacion: simplex,
        logistica: transport
      };

      // 2. Hacemos la petición a tu webhook de Make.com
      const response = await fetch("https://hook.us2.make.com/jd93ggdb1y16hbvjl5epqif3ndakbklq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reporte", // Esto dirige el flujo por la Ruta A en Make
          company_name: profile.name,
          industry: profile.industry,
          datos_modelo: JSON.stringify(datosModelo) // Pasamos toda la matriz matemática
        })
      });

      if (!response.ok) throw new Error("Error en la respuesta del servidor");

      // 3. Recibimos el texto dinámico generado por la IA
      const text = await response.text();
      
      // 4. Mostramos el reporte en pantalla
      setReport(text);

    } catch (error) {
      console.error("Error al generar el reporte:", error);
      setReport("Lo siento, hubo un problema de conexión con el motor estratégico. Por favor, intenta generar el reporte nuevamente.");
    } finally {
      setLoading(false);
    }
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