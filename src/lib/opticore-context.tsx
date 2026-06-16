import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export interface CompanyProfile {
  name: string;
  industry: string;
  resource1Name: string;
  resource2Name: string;
  demandName: string;
}

export interface SimplexInputs {
  resource1: number;
  resource2: number;
  demand: number;
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
  simplex: SimplexInputs;
  setSimplex: (p: Partial<SimplexInputs>) => void;
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
  const [simplex, setSimplexState] = useState<SimplexInputs>({
    resource1: 60,
    resource2: 80,
    demand: 120,
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
      [40, 10],
      [0, 50],
    ],
    optimalCost: 1100,
  });
  const [report, setReport] = useState<string | null>(null);

  const value = useMemo<Ctx>(
    () => ({
      profile,
      setProfile: (p) => setProfileState((prev) => ({ ...prev, ...p })),
      simplex,
      setSimplex: (p) => setSimplexState((prev) => ({ ...prev, ...p })),
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