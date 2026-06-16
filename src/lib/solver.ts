import solver from "javascript-lp-solver";

export type ConstraintOp = "<=" | ">=" | "=";

export interface SimplexVariable {
  name: string;
  coef: number;
}

export interface SimplexConstraint {
  name: string;
  coefs: number[]; // length === variables.length
  op: ConstraintOp;
  rhs: number;
}

export interface SimplexModel {
  opType: "max" | "min";
  variables: SimplexVariable[];
  constraints: SimplexConstraint[];
}

export interface SimplexResult {
  feasible: boolean;
  bounded: boolean;
  z: number;
  values: number[]; // one per variable
  slacks: number[]; // one per constraint
  shadow: number[]; // one per constraint (numerical sensitivity)
}

function buildModel(m: SimplexModel, rhsOverride?: { index: number; value: number }) {
  const variables: Record<string, Record<string, number>> = {};
  m.variables.forEach((v, i) => {
    const obj: Record<string, number> = { _z: v.coef };
    m.constraints.forEach((c, ci) => {
      obj[`c${ci}`] = c.coefs[i] ?? 0;
    });
    variables[v.name || `x${i + 1}`] = obj;
  });

  const constraints: Record<string, { min?: number; max?: number; equal?: number }> = {};
  m.constraints.forEach((c, ci) => {
    const rhs = rhsOverride && rhsOverride.index === ci ? rhsOverride.value : c.rhs;
    if (c.op === "<=") constraints[`c${ci}`] = { max: rhs };
    else if (c.op === ">=") constraints[`c${ci}`] = { min: rhs };
    else constraints[`c${ci}`] = { equal: rhs };
  });

  return {
    optimize: "_z",
    opType: m.opType,
    constraints,
    variables,
  };
}

export function solveSimplex(m: SimplexModel): SimplexResult {
  if (m.variables.length === 0 || m.constraints.length === 0) {
    return { feasible: false, bounded: true, z: 0, values: [], slacks: [], shadow: [] };
  }
  const model = buildModel(m);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res: any = solver.Solve(model);
  const feasible = !!res.feasible;
  const bounded = res.bounded !== false;
  const values = m.variables.map((v, i) => Number(res[v.name || `x${i + 1}`] ?? 0));
  const z = feasible ? Number(res.result ?? 0) : 0;

  const slacks = m.constraints.map((c) => {
    const used = c.coefs.reduce((s, a, i) => s + a * (values[i] ?? 0), 0);
    return +(c.rhs - used).toFixed(4);
  });

  // Shadow prices via numerical perturbation (sensitivity ~ +1 unit on RHS)
  const shadow = m.constraints.map((_, ci) => {
    if (!feasible) return 0;
    try {
      const perturbed = buildModel(m, { index: ci, value: m.constraints[ci].rhs + 1 });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r2: any = solver.Solve(perturbed);
      if (!r2.feasible) return 0;
      const z2 = Number(r2.result ?? 0);
      const diff = z2 - z;
      return +diff.toFixed(4);
    } catch {
      return 0;
    }
  });

  return { feasible, bounded, z: +z.toFixed(4), values: values.map((v) => +v.toFixed(4)), slacks, shadow };
}

export interface TransportSolution {
  feasible: boolean;
  optimalCost: number;
  assignment: number[][]; // rows = supplies, cols = demands
}

export function solveTransport(
  supplies: number[],
  demands: number[],
  costs: number[][],
): TransportSolution {
  const m = supplies.length;
  const n = demands.length;
  if (m === 0 || n === 0) {
    return { feasible: false, optimalCost: 0, assignment: [] };
  }
  const totalSupply = supplies.reduce((s, a) => s + a, 0);
  const totalDemand = demands.reduce((s, a) => s + a, 0);

  // Balance the problem with a dummy column or row of zero cost
  let S = [...supplies];
  let D = [...demands];
  let C = costs.map((row) => [...row]);
  let addedDummyCol = false;
  let addedDummyRow = false;
  if (totalSupply > totalDemand) {
    D = [...D, totalSupply - totalDemand];
    C = C.map((row) => [...row, 0]);
    addedDummyCol = true;
  } else if (totalDemand > totalSupply) {
    S = [...S, totalDemand - totalSupply];
    C = [...C, new Array(n).fill(0)];
    addedDummyRow = true;
  }

  const variables: Record<string, Record<string, number>> = {};
  const constraints: Record<string, { equal: number }> = {};

  for (let i = 0; i < S.length; i++) {
    constraints[`s${i}`] = { equal: S[i] };
  }
  for (let j = 0; j < D.length; j++) {
    constraints[`d${j}`] = { equal: D[j] };
  }

  for (let i = 0; i < S.length; i++) {
    for (let j = 0; j < D.length; j++) {
      const key = `x_${i}_${j}`;
      variables[key] = {
        _z: C[i][j] ?? 0,
        [`s${i}`]: 1,
        [`d${j}`]: 1,
      };
    }
  }

  const model = {
    optimize: "_z",
    opType: "min" as const,
    constraints,
    variables,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res: any = solver.Solve(model);
  if (!res.feasible) {
    return { feasible: false, optimalCost: 0, assignment: Array.from({ length: m }, () => new Array(n).fill(0)) };
  }

  const assignment: number[][] = Array.from({ length: m }, () => new Array(n).fill(0));
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      assignment[i][j] = Math.round(Number(res[`x_${i}_${j}`] ?? 0) * 10000) / 10000;
    }
  }

  // Real cost uses only real (non-dummy) cells
  let optimalCost = 0;
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      optimalCost += assignment[i][j] * (costs[i]?.[j] ?? 0);
    }
  }

  void addedDummyCol;
  void addedDummyRow;

  return { feasible: true, optimalCost: +optimalCost.toFixed(2), assignment };
}