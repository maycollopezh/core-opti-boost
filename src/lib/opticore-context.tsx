import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { ConstraintOp } from "./solver";

export interface CompanyProfile {
  name: string;
  industry: string;
  resource1Name: string;
  resource2Name: string;
  demandName: string;
}

export interface SimplexVariableInput {
  name: string;
  coef: number;
}

export interface SimplexConstraintInput {
  name: string;
  coefs: number[];
  op: ConstraintOp;
  rhs: number;
}

export interface SimplexModelInput {
  opType: "max" | "min";
  variables: SimplexVariableInput[];
  constraints: SimplexConstraintInput[];
}

export interface TransportData {
  supplies: { name: string; capacity: number }[];
  demands: { name: string; demand: number }[];
  costs: number[][];
  assignment: number[][];
  optimalCost: number;
}

interface Ctx {
  profile: CompanyProfile;
  setProfile: (p: Partial<CompanyProfile>) => void;
  simplex: SimplexModelInput;
  setSimplex: (updater: SimplexModelInput | ((prev: SimplexModelInput) => SimplexModelInput)) => void;
  transport: TransportData;
  setTransport: (updater: TransportData | ((prev: TransportData) => TransportData)) => void;
  report: string | null;
  setReport: (r: string | null) => void;
}

const OptiContext = createContext<Ctx | null>(null);

export function OptiProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<CompanyProfile>({
    name: "DataCom Bolivia",
    industry: "Servicios IT",
    resource1Name: "Computadoras Físicas",
    resource2Name: "Horas de Técnico",
    demandName: "Solicitudes Mínimas",
  });
  const [simplex, setSimplexState] = useState<SimplexModelInput>({
    opType: "max",
    variables: [
      { name: "x1", coef: 3 },
      { name: "x2", coef: 5 },
    ],
    constraints: [
      { name: "R1", coefs: [1, 0], op: "<=", rhs: 4 },
      { name: "R2", coefs: [0, 2], op: "<=", rhs: 12 },
      { name: "R3", coefs: [3, 2], op: "<=", rhs: 18 },
    ],
  });
  const [transport, setTransportState] = useState<TransportData>({
    supplies: [
      { name: "Soporte Tradicional", capacity: 50 },
      { name: "Soporte Virtualizado", capacity: 50 },
    ],
    demands: [
      { name: "La Paz", demand: 40 },
      { name: "El Alto", demand: 60 },
    ],
    costs: [
      [8, 12],
      [10, 9],
    ],
    assignment: [
      [0, 0],
      [0, 0],
    ],
    optimalCost: 0,
  });
  const [report, setReport] = useState<string | null>(null);

  const value = useMemo<Ctx>(
    () => ({
      profile,
      setProfile: (p) => setProfileState((prev) => ({ ...prev, ...p })),
      simplex,
      setSimplex: (u) =>
        setSimplexState((prev) =>
          typeof u === "function" ? (u as (p: SimplexModelInput) => SimplexModelInput)(prev) : u,
        ),
      transport,
      setTransport: (u) =>
        setTransportState((prev) => (typeof u === "function" ? (u as (p: TransportData) => TransportData)(prev) : u)),
      report,
      setReport,
    }),
    [profile, simplex, transport, report],
  );

  return <OptiContext.Provider value={value}>{children}</OptiContext.Provider>;
}

export function useOpti() {
  const ctx = useContext(OptiContext);
  if (!ctx) throw new Error("useOpti must be used within OptiProvider");
  return ctx;
}