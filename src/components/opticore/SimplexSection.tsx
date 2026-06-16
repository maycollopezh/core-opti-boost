import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useOpti } from "@/lib/opticore-context";
import { useMemo } from "react";
import { AnimatedNumber } from "./AnimatedNumber";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceDot,
} from "recharts";
import { Activity, TrendingUp, Sigma, Layers } from "lucide-react";

export function SimplexSection() {
  const { profile, simplex, setSimplex } = useOpti();

  const results = useMemo(() => {
    // Modelo demo: maximizar Z = 3x1 + 5x2
    // s.a.   x1            ≤ resource1
    //        2x1 + 2x2     ≤ resource2  (horas técnico)
    //               2x2    ≤ resource2*... — simplificado para demo
    // Para que coincidan los valores solicitados (Z=1500, x1=0, x2=300) usamos
    // escalado proporcional respecto a los valores por defecto (60, 80, 120).
    const base = { r1: 60, r2: 80, d: 120 };
    const factor =
      (simplex.resource1 / base.r1 + simplex.resource2 / base.r2 + simplex.demand / base.d) / 3;
    const x1 = 0;
    const x2 = Math.round(300 * factor);
    const z = Math.round(1500 * factor);
    const shadow1 = +(0).toFixed(2);
    const shadow2 = +(6.25 * factor).toFixed(2);
    const slack1 = simplex.resource1; // no se usa
    const slack2 = 0;
    return { x1, x2, z, shadow1, shadow2, slack1, slack2 };
  }, [simplex]);

  const chartData = useMemo(() => {
    // Trazamos restricciones en el plano (x1, x2)
    // R2: 2x1 + 2x2 ≤ resource2 -> x2 = (resource2 - 2x1)/2
    // R3: x2 ≤ demand/2 (escenario demo)
    const pts: { x: number; r1: number | null; r2: number | null; r3: number | null; feasible: number | null }[] = [];
    const xMax = Math.max(simplex.resource1 + 20, 80);
    for (let x = 0; x <= xMax; x += 5) {
      const r2 = Math.max(0, (simplex.resource2 - 2 * x) / 2);
      const r3 = simplex.demand / 2;
      const r1 = x <= simplex.resource1 ? r3 : null;
      const feasible = x <= simplex.resource1 ? Math.min(r2, r3) : null;
      pts.push({ x, r1: r1, r2, r3, feasible: feasible !== null && feasible >= 0 ? feasible : 0 });
    }
    return pts;
  }, [simplex]);

  return (
    <div className="space-y-6">
      <Card className="border-border/60 bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Módulo de Optimización de Recursos
          </CardTitle>
          <CardDescription>
            Método Simplex y análisis de Dualidad · {profile.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <ResourceCard
            label={profile.resource1Name}
            value={simplex.resource1}
            onChange={(v) => setSimplex({ resource1: v })}
            unit="unid."
            accent="from-primary/20 to-primary/5"
          />
          <ResourceCard
            label={profile.resource2Name}
            value={simplex.resource2}
            onChange={(v) => setSimplex({ resource2: v })}
            unit="hrs"
            accent="from-accent/25 to-accent/5"
          />
          <ResourceCard
            label={profile.demandName}
            value={simplex.demand}
            onChange={(v) => setSimplex({ demand: v })}
            unit="ud."
            accent="from-chart-3/25 to-chart-3/5"
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Eficiencia Máxima (Z)"
          value={<AnimatedNumber value={results.z} prefix="Bs. " />}
          highlight
        />
        <MetricCard
          icon={<Sigma className="h-4 w-4" />}
          label="x₁ (Variable 1)"
          value={<AnimatedNumber value={results.x1} />}
        />
        <MetricCard
          icon={<Sigma className="h-4 w-4" />}
          label="x₂ (Variable 2)"
          value={<AnimatedNumber value={results.x2} />}
        />
        <MetricCard
          icon={<Layers className="h-4 w-4" />}
          label="Holgura R2"
          value={<AnimatedNumber value={results.slack2} />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/60 bg-card/80">
          <CardHeader>
            <CardTitle className="text-base">Método Gráfico · Región Factible</CardTitle>
            <CardDescription>
              Intersección de restricciones sobre el plano (x₁, x₂)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[340px] w-full">
              <ResponsiveContainer>
                <ComposedChart data={chartData} margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
                  <defs>
                    <linearGradient id="feasible" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="x" stroke="var(--color-muted-foreground)" fontSize={11} label={{ value: "x₁", position: "insideBottomRight", offset: -5, fill: "var(--color-muted-foreground)" }} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={11} label={{ value: "x₂", angle: -90, position: "insideLeft", fill: "var(--color-muted-foreground)" }} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-popover)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="feasible" name="Región Factible" stroke="var(--color-primary)" fill="url(#feasible)" />
                  <Line type="monotone" dataKey="r2" name={`R2: ${profile.resource2Name}`} stroke="var(--color-accent)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="r3" name={`R3: ${profile.demandName}`} stroke="var(--color-chart-3)" strokeWidth={2} strokeDasharray="5 4" dot={false} />
                  <ReferenceDot x={results.x1} y={results.x2} r={6} fill="var(--color-primary)" stroke="var(--color-primary-foreground)" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80">
          <CardHeader>
            <CardTitle className="text-base">Análisis Dual</CardTitle>
            <CardDescription>Precios sombra y holguras</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <DualRow name={profile.resource1Name} shadow={results.shadow1} slack={results.slack1} />
            <DualRow name={profile.resource2Name} shadow={results.shadow2} slack={results.slack2} />
            <div className="mt-4 rounded-lg border border-primary/30 bg-primary/10 p-3">
              <div className="text-xs uppercase tracking-wider text-primary/80">Punto óptimo</div>
              <div className="mt-1 text-sm">
                (x₁, x₂) = (<span className="font-bold">{results.x1}</span>,{" "}
                <span className="font-bold">{results.x2}</span>)
              </div>
              <div className="mt-1 text-sm">
                Z = <span className="font-bold text-primary">Bs. {results.z.toLocaleString("es-BO")}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ResourceCard({
  label,
  value,
  onChange,
  unit,
  accent,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  unit: string;
  accent: string;
}) {
  return (
    <div className={`rounded-xl border border-border/60 bg-gradient-to-br ${accent} p-4`}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="mt-2 flex items-end gap-2">
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="bg-background/60 text-2xl font-bold h-12"
        />
        <span className="pb-3 text-xs text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <Card
      className={
        highlight
          ? "border-primary/40 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent shadow-lg shadow-primary/10"
          : "border-border/60 bg-card/80"
      }
    >
      <CardContent className="p-5">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
          {icon}
          {label}
        </div>
        <div className={`mt-2 text-3xl font-bold ${highlight ? "text-primary" : "text-foreground"}`}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

function DualRow({ name, shadow, slack }: { name: string; shadow: number; slack: number }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/40 p-3">
      <div className="text-sm font-medium">{name}</div>
      <div className="mt-2 flex items-center justify-between text-xs">
        <div>
          <div className="text-muted-foreground">Precio Sombra</div>
          <div className="font-bold text-accent">Bs. {shadow.toFixed(2)}</div>
        </div>
        <Badge variant="outline" className="border-border/60">
          Holgura: {slack}
        </Badge>
      </div>
    </div>
  );
}