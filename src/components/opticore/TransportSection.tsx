import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useOpti, type TransportData } from "@/lib/opticore-context";
import { Plus, Trash2, Truck, Coins, AlertTriangle } from "lucide-react";
import { AnimatedNumber } from "./AnimatedNumber";
import { solveTransport } from "@/lib/solver";
import { useEffect, useMemo } from "react";

export function TransportSection() {
  const { transport, setTransport } = useOpti();

  const solution = useMemo(
    () =>
      solveTransport(
        transport.supplies.map((s) => s.capacity),
        transport.demands.map((d) => d.demand),
        transport.costs,
      ),
    [transport.supplies, transport.demands, transport.costs],
  );

  // Sync solver output into context so other modules (report) can read it
  useEffect(() => {
    setTransport((prev) => {
      const sameCost = prev.optimalCost === solution.optimalCost;
      const sameAssignment =
        prev.assignment.length === solution.assignment.length &&
        prev.assignment.every(
          (row, i) =>
            row.length === (solution.assignment[i]?.length ?? 0) &&
            row.every((v, j) => v === solution.assignment[i]?.[j]),
        );
      if (sameCost && sameAssignment) return prev;
      return { ...prev, assignment: solution.assignment, optimalCost: solution.optimalCost };
    });
  }, [solution, setTransport]);

  const updateCost = (i: number, j: number, v: number) =>
    setTransport((prev: TransportData) => {
      const costs = prev.costs.map((row) => [...row]);
      costs[i][j] = v;
      return { ...prev, costs };
    });

  const updateSupply = (i: number, field: "name" | "capacity", v: string | number) =>
    setTransport((prev) => {
      const supplies = [...prev.supplies];
      supplies[i] = { ...supplies[i], [field]: v } as { name: string; capacity: number };
      return { ...prev, supplies };
    });

  const updateDemand = (j: number, field: "name" | "demand", v: string | number) =>
    setTransport((prev) => {
      const demands = [...prev.demands];
      demands[j] = { ...demands[j], [field]: v } as { name: string; demand: number };
      return { ...prev, demands };
    });

  const addSupply = () =>
    setTransport((prev) => ({
      ...prev,
      supplies: [...prev.supplies, { name: `Nodo ${prev.supplies.length + 1}`, capacity: 30 }],
      costs: [...prev.costs, prev.demands.map(() => 10)],
      assignment: [...prev.assignment, prev.demands.map(() => 0)],
    }));

  const removeSupply = (i: number) =>
    setTransport((prev) => ({
      ...prev,
      supplies: prev.supplies.filter((_, k) => k !== i),
      costs: prev.costs.filter((_, k) => k !== i),
      assignment: prev.assignment.filter((_, k) => k !== i),
    }));

  const addDemand = () =>
    setTransport((prev) => ({
      ...prev,
      demands: [...prev.demands, { name: `Destino ${prev.demands.length + 1}`, demand: 20 }],
      costs: prev.costs.map((row) => [...row, 10]),
      assignment: prev.assignment.map((row) => [...row, 0]),
    }));

  const removeDemand = (j: number) =>
    setTransport((prev) => ({
      ...prev,
      demands: prev.demands.filter((_, k) => k !== j),
      costs: prev.costs.map((row) => row.filter((_, k) => k !== j)),
      assignment: prev.assignment.map((row) => row.filter((_, k) => k !== j)),
    }));

  return (
    <div className="space-y-6">
      <Card className="border-border/60 bg-card/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            Módulo de Distribución Logística
          </CardTitle>
          <CardDescription>
            Modelo de Transporte · Costos unitarios en Bolivianos (Bs.)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="p-3 text-left font-medium text-muted-foreground">Oferta \ Destino</th>
                  {transport.demands.map((d, j) => (
                    <th key={j} className="p-3 text-left">
                      <div className="flex items-center gap-2">
                        <Input
                          value={d.name}
                          onChange={(e) => updateDemand(j, "name", e.target.value)}
                          className="h-8 w-32"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => removeDemand(j)}
                          disabled={transport.demands.length <= 1}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <Input
                        type="number"
                        value={d.demand}
                        onChange={(e) => updateDemand(j, "demand", Number(e.target.value) || 0)}
                        className="mt-1 h-8 w-32 text-xs"
                        placeholder="Demanda"
                      />
                    </th>
                  ))}
                  <th className="p-3">
                    <Button size="sm" variant="outline" onClick={addDemand}>
                      <Plus className="h-3.5 w-3.5 mr-1" /> Destino
                    </Button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {transport.supplies.map((s, i) => (
                  <tr key={i} className="border-t border-border/60">
                    <td className="p-3 align-top">
                      <div className="flex items-center gap-2">
                        <Input
                          value={s.name}
                          onChange={(e) => updateSupply(i, "name", e.target.value)}
                          className="h-8 w-44"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => removeSupply(i)}
                          disabled={transport.supplies.length <= 1}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <Input
                        type="number"
                        value={s.capacity}
                        onChange={(e) => updateSupply(i, "capacity", Number(e.target.value) || 0)}
                        className="mt-1 h-8 w-44 text-xs"
                        placeholder="Capacidad"
                      />
                    </td>
                    {transport.demands.map((_, j) => (
                      <td key={j} className="p-3">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <span>Bs.</span>
                          <Input
                            type="number"
                            value={transport.costs[i]?.[j] ?? 0}
                            onChange={(e) => updateCost(i, j, Number(e.target.value) || 0)}
                            className="h-9 w-20 font-semibold"
                          />
                        </div>
                      </td>
                    ))}
                    <td />
                  </tr>
                ))}
                <tr className="border-t border-border/60">
                  <td className="p-3">
                    <Button size="sm" variant="outline" onClick={addSupply}>
                      <Plus className="h-3.5 w-3.5 mr-1" /> Oferta
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/60 bg-card/80">
          <CardHeader>
            <CardTitle className="text-base">Asignación Óptima</CardTitle>
            <CardDescription>Unidades distribuidas hacia cada destino</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-xl border border-border/60">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="p-3 text-left text-muted-foreground">Origen</th>
                    {transport.demands.map((d, j) => (
                      <th key={j} className="p-3 text-left">{d.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transport.supplies.map((s, i) => (
                    <tr key={i} className="border-t border-border/60">
                      <td className="p-3 font-medium">{s.name}</td>
                      {transport.demands.map((_, j) => {
                        const v = transport.assignment[i]?.[j] ?? 0;
                        return (
                          <td key={j} className="p-3">
                            <div
                              className={
                                v > 0
                                  ? "inline-flex items-center justify-center min-w-12 rounded-md bg-primary/15 px-3 py-1 font-bold text-primary"
                                  : "inline-flex items-center justify-center min-w-12 rounded-md bg-muted/40 px-3 py-1 text-muted-foreground"
                              }
                            >
                              {v}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="border-accent/40 bg-gradient-to-br from-accent/20 via-primary/10 to-transparent shadow-xl shadow-accent/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Coins className="h-5 w-5 text-accent" />
              Costo Mínimo de Operación
            </CardTitle>
            <CardDescription>
              {solution.feasible
                ? "Calculado vía Programación Lineal (Simplex)"
                : "Modelo infactible con los parámetros actuales"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-black tracking-tight text-accent">
              <AnimatedNumber value={solution.optimalCost} prefix="Bs. " />
            </div>
            {!solution.feasible && (
              <div className="mt-3 flex items-center gap-2 text-xs text-destructive">
                <AlertTriangle className="h-3.5 w-3.5" />
                Verifique capacidades, demandas y costos ingresados.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}