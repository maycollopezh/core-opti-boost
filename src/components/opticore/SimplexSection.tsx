import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOpti, type SimplexModelInput } from "@/lib/opticore-context";
import { useMemo } from "react";
import { AnimatedNumber } from "./AnimatedNumber";
import { solveSimplex, type ConstraintOp } from "@/lib/solver";
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
import { Activity, TrendingUp, Sigma, Layers, Plus, Trash2, AlertTriangle, Package, Boxes } from "lucide-react";

export function SimplexSection() {
  const { profile, simplex, setSimplex } = useOpti();

  const result = useMemo(
    () =>
      solveSimplex({
        opType: simplex.opType,
        variables: simplex.variables,
        constraints: simplex.constraints,
      }),
    [simplex],
  );

  const addVariable = () =>
    setSimplex((prev: SimplexModelInput) => ({
      ...prev,
      variables: [
        ...prev.variables,
        { name: `Producto ${prev.variables.length + 1}`, coef: 1 },
      ],
      constraints: prev.constraints.map((c) => ({ ...c, coefs: [...c.coefs, 0] })),
    }));

  const removeVariable = (idx: number) =>
    setSimplex((prev) => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== idx),
      constraints: prev.constraints.map((c) => ({ ...c, coefs: c.coefs.filter((_, i) => i !== idx) })),
    }));

  const addConstraint = () =>
    setSimplex((prev) => ({
      ...prev,
      constraints: [
        ...prev.constraints,
        {
          name: `Recurso ${prev.constraints.length + 1}`,
          coefs: prev.variables.map(() => 0),
          op: "<=",
          rhs: 0,
        },
      ],
    }));

  const removeConstraint = (idx: number) =>
    setSimplex((prev) => ({ ...prev, constraints: prev.constraints.filter((_, i) => i !== idx) }));

  const updateVar = (idx: number, patch: Partial<{ name: string; coef: number }>) =>
    setSimplex((prev) => ({
      ...prev,
      variables: prev.variables.map((v, i) => (i === idx ? { ...v, ...patch } : v)),
    }));

  const updateConstraint = (
    idx: number,
    patch: Partial<{ name: string; op: ConstraintOp; rhs: number }>,
  ) =>
    setSimplex((prev) => ({
      ...prev,
      constraints: prev.constraints.map((c, i) => (i === idx ? { ...c, ...patch } : c)),
    }));

  const updateConstraintCoef = (cIdx: number, vIdx: number, value: number) =>
    setSimplex((prev) => ({
      ...prev,
      constraints: prev.constraints.map((c, i) =>
        i === cIdx ? { ...c, coefs: c.coefs.map((x, j) => (j === vIdx ? value : x)) } : c,
      ),
    }));

  const setOpType = (op: "max" | "min") => setSimplex((prev) => ({ ...prev, opType: op }));

  const twoVars = simplex.variables.length === 2;
  const isMax = simplex.opType === "max";
  const unitLabel = isMax ? "Margen de Ganancia unitario (Bs.)" : "Costo unitario (Bs.)";

  const chartData = useMemo(() => {
    if (!twoVars) return [];
    // x-range: use max RHS / coef estimate
    const xMaxCandidates: number[] = [10];
    simplex.constraints.forEach((c) => {
      const a = c.coefs[0];
      if (a && a > 0) xMaxCandidates.push(c.rhs / a);
      const b = c.coefs[1];
      if (b && b > 0) xMaxCandidates.push(c.rhs / b);
    });
    const xMax = Math.max(...xMaxCandidates.map((v) => Math.abs(v))) * 1.2 || 10;
    const steps = 40;
    const pts: Record<string, number | null>[] = [];
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * xMax;
      const row: Record<string, number | null> = { x: +x.toFixed(3) };
      let feasibleMin = Infinity;
      simplex.constraints.forEach((c, idx) => {
        const a = c.coefs[0] ?? 0;
        const b = c.coefs[1] ?? 0;
        let y: number | null = null;
        if (b !== 0) y = (c.rhs - a * x) / b;
        row[`c${idx}`] = y !== null && isFinite(y) ? +y.toFixed(3) : null;
        // For feasible region with <= constraints
        if (b > 0 && c.op === "<=") {
          const yLim = (c.rhs - a * x) / b;
          feasibleMin = Math.min(feasibleMin, yLim);
        } else if (b > 0 && c.op === ">=") {
          // lower bound — ignored for upper envelope shading
        }
      });
      row.feasible = feasibleMin === Infinity ? null : Math.max(0, +feasibleMin.toFixed(3));
      pts.push(row);
    }
    return pts;
  }, [simplex, twoVars]);

  const z = result.feasible ? result.z : 0;
  const x1 = result.values[0] ?? 0;
  const x2 = result.values[1] ?? 0;

  return (
    <div className="space-y-6">
      <Card className="border-border/60 bg-card/80 backdrop-blur">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Plan de Optimización del Negocio
              </CardTitle>
              <CardDescription>
                {profile.name} · Resultados expresados en Bolivianos (Bs.)
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  ¿Cuál es el objetivo principal?
                </span>
                <Select value={simplex.opType} onValueChange={(v) => setOpType(v as "max" | "min")}>
                  <SelectTrigger className="h-9 w-60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="max">Maximizar Ganancias</SelectItem>
                    <SelectItem value="min">Minimizar Costos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Objective function */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  Productos o Servicios a Ofrecer
                </div>
                <div className="text-xs text-muted-foreground">
                  Define cada línea de negocio y su {isMax ? "margen de ganancia" : "costo"} unitario en Bs.
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={addVariable}>
                <Plus className="mr-1 h-3.5 w-3.5" /> Añadir Producto/Servicio
              </Button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {simplex.variables.map((v, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-2 rounded-lg border border-border/60 bg-background/50 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Nombre del producto/servicio
                    </label>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => removeVariable(i)}
                      disabled={simplex.variables.length <= 1}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <Input
                    value={v.name}
                    onChange={(e) => updateVar(i, { name: e.target.value })}
                    placeholder="Ej. Mantenimiento Servidores"
                    className="h-9"
                  />
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {unitLabel}
                  </label>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">Bs.</span>
                    <Input
                      type="number"
                      value={v.coef}
                      onChange={(e) => updateVar(i, { coef: Number(e.target.value) || 0 })}
                      className="h-9 font-bold"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Constraints */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold flex items-center gap-2">
                  <Boxes className="h-4 w-4 text-accent" />
                  Recursos Limitantes (Tus cuellos de botella)
                </div>
                <div className="text-xs text-muted-foreground">
                  Indica cuánto consume cada producto y la disponibilidad total del recurso.
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={addConstraint}>
                <Plus className="mr-1 h-3.5 w-3.5" /> Añadir Recurso
              </Button>
            </div>
            <div className="overflow-x-auto rounded-xl border border-border/60">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="p-2 text-left text-muted-foreground">Recurso</th>
                    {simplex.variables.map((v, i) => (
                      <th key={i} className="p-2 text-left text-primary">
                        <div>{v.name || `Producto ${i + 1}`}</div>
                        <div className="text-[10px] font-normal text-muted-foreground">
                          ¿Cuánto consume 1 unidad?
                        </div>
                      </th>
                    ))}
                    <th className="p-2 text-left text-muted-foreground">Op.</th>
                    <th className="p-2 text-left text-muted-foreground">
                      Disponibilidad Total del Recurso
                    </th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {simplex.constraints.map((c, ci) => (
                    <tr key={ci} className="border-t border-border/60">
                      <td className="p-2">
                        <Input
                          value={c.name}
                          onChange={(e) => updateConstraint(ci, { name: e.target.value })}
                          className="h-8 w-44"
                          placeholder="Ej. Horas Técnico"
                        />
                      </td>
                      {simplex.variables.map((_, vi) => (
                        <td key={vi} className="p-2">
                          <Input
                            type="number"
                            value={c.coefs[vi] ?? 0}
                            onChange={(e) =>
                              updateConstraintCoef(ci, vi, Number(e.target.value) || 0)
                            }
                            className="h-8 w-20"
                          />
                        </td>
                      ))}
                      <td className="p-2">
                        <Select
                          value={c.op}
                          onValueChange={(v) => updateConstraint(ci, { op: v as ConstraintOp })}
                        >
                          <SelectTrigger className="h-8 w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="<=">≤</SelectItem>
                            <SelectItem value=">=">≥</SelectItem>
                            <SelectItem value="=">=</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          value={c.rhs}
                          onChange={(e) => updateConstraint(ci, { rhs: Number(e.target.value) || 0 })}
                          className="h-8 w-24 font-semibold"
                        />
                      </td>
                      <td className="p-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => removeConstraint(ci)}
                          disabled={simplex.constraints.length <= 1}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status */}
      {!result.feasible && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4" />
          El modelo es infactible o no acotado con los parámetros actuales.
        </div>
      )}

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={<TrendingUp className="h-4 w-4" />}
          label={isMax ? "Beneficio Operativo Estimado" : "Costo Operativo Estimado"}
          value={<AnimatedNumber value={z} prefix="Bs. " />}
          highlight
        />
        {simplex.variables.slice(0, 3).map((v, i) => (
          <MetricCard
            key={i}
            icon={<Sigma className="h-4 w-4" />}
            label={`Unidades a producir de ${v.name || `Producto ${i + 1}`}`}
            value={<AnimatedNumber value={result.values[i] ?? 0} />}
          />
        ))}
      </div>

      {/* All variables grid when > 3 */}
      {simplex.variables.length > 3 && (
        <Card className="border-border/60 bg-card/80">
          <CardHeader>
            <CardTitle className="text-base">Plan Óptimo de Producción</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {simplex.variables.map((v, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-border/60 bg-background/40 p-3 text-center"
                >
                  <div className="text-xs text-muted-foreground">
                    Unidades de {v.name || `Producto ${i + 1}`}
                  </div>
                  <div className="mt-1 font-bold text-primary">
                    {(result.values[i] ?? 0).toLocaleString("es-BO")}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/60 bg-card/80">
          <CardHeader>
            <CardTitle className="text-base">Visualización de Escenarios Posibles</CardTitle>
            <CardDescription>
              {twoVars
                ? "Combinaciones viables entre tus dos productos/servicios"
                : "Disponible únicamente cuando ofreces exactamente 2 productos/servicios"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {twoVars ? (
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
                    <XAxis
                      dataKey="x"
                      type="number"
                      stroke="var(--color-muted-foreground)"
                      fontSize={11}
                      label={{ value: simplex.variables[0]?.name ?? "Producto 1", position: "insideBottomRight", offset: -5, fill: "var(--color-muted-foreground)" }}
                    />
                    <YAxis
                      stroke="var(--color-muted-foreground)"
                      fontSize={11}
                      label={{ value: simplex.variables[1]?.name ?? "Producto 2", angle: -90, position: "insideLeft", fill: "var(--color-muted-foreground)" }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--color-popover)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Area
                      type="monotone"
                      dataKey="feasible"
                      name="Escenarios Viables"
                      stroke="var(--color-primary)"
                      fill="url(#feasible)"
                      isAnimationActive={false}
                    />
                    {simplex.constraints.map((c, idx) => {
                      const palette = [
                        "var(--color-accent)",
                        "var(--color-chart-3)",
                        "var(--color-chart-4)",
                        "var(--color-chart-5)",
                      ];
                      return (
                        <Line
                          key={idx}
                          type="linear"
                          dataKey={`c${idx}`}
                          name={`${c.name}: ${c.op} ${c.rhs}`}
                          stroke={palette[idx % palette.length]}
                          strokeWidth={2}
                          strokeDasharray={c.op === ">=" ? "5 4" : undefined}
                          dot={false}
                          connectNulls
                          isAnimationActive={false}
                        />
                      );
                    })}
                    {result.feasible && (
                      <ReferenceDot
                        x={x1}
                        y={x2}
                        r={6}
                        fill="var(--color-primary)"
                        stroke="var(--color-primary-foreground)"
                      />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-[340px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/60 bg-background/40 text-center">
                <Layers className="h-8 w-8 text-muted-foreground" />
                <div className="max-w-sm text-sm text-muted-foreground">
                  La gráfica se muestra solo cuando ofreces exactamente 2 productos o servicios. Revisa
                  los resultados numéricos arriba.
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80">
          <CardHeader>
            <CardTitle className="text-base">Diagnóstico de Recursos</CardTitle>
            <CardDescription>Valor estratégico y sobrante por cada recurso</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {simplex.constraints.map((c, i) => (
              <DualRow
                key={i}
                name={c.name}
                shadow={result.shadow[i] ?? 0}
                slack={result.slacks[i] ?? 0}
              />
            ))}
            <div className="mt-4 rounded-lg border border-primary/30 bg-primary/10 p-3">
              <div className="text-xs uppercase tracking-wider text-primary/80">
                {isMax ? "Beneficio Operativo Estimado" : "Costo Operativo Estimado"}
              </div>
              <div className="mt-1 text-sm">
                <span className="font-bold text-primary">
                  Bs. {z.toLocaleString("es-BO", { maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
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
        <div
          className={`mt-2 text-3xl font-bold ${highlight ? "text-primary" : "text-foreground"}`}
        >
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
          <div className="text-muted-foreground">Valor de 1 unidad adicional</div>
          <div className="font-bold text-accent">Bs. {shadow.toFixed(2)}</div>
        </div>
        <Badge variant="outline" className="border-border/60">
          Recurso sobrante: {slack.toLocaleString("es-BO", { maximumFractionDigits: 2 })}
        </Badge>
      </div>
    </div>
  );
}