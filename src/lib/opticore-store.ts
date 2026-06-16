import { create } from "zustand";

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

export interface SimplexResults {
  z: number;
  x1: number;
  x2: number;
  shadowPrices: { name: string; value: number }[];
  slacks: { name: string; value: number }[];
}

export interface TransportCell {
  cost: number;
  assigned: number;
}
export interface TransportData {
  supplies: { name: string; capacity: number }[];
  demands: { name: string; demand: number }[];
  costs: number[][]; // [supply][demand]
  optimalCost: number;
  assignment: number[][];
}

interface State {
  profile: CompanyProfile;
  setProfile: (p: Partial<CompanyProfile>) => void;
  simplex: SimplexInputs;
  setSimplex: (p: Partial<SimplexInputs>) => void;
  transport: TransportData;
  setTransport: (p: Partial<TransportData>) => void;
  report: string | null;
  setReport: (r: string | null) => void;
}

const defaultTransport: TransportData = {
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
  optimalCost: 1100,
  assignment: [
    [40, 10],
    [0, 50],
  ],
};

export const useOpti = create<State>((set) => ({
  profile: {
    name: "DataCom Bolivia",
    industry: "Servicios IT",
    resource1Name: "Computadoras Físicas",
    resource2Name: "Horas de Técnico",
    demandName: "Solicitudes Mínimas",
  },
  setProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),
  simplex: { resource1: 60, resource2: 80, demand: 120 },
  setSimplex: (p) => set((s) => ({ simplex: { ...s.simplex, ...p } })),
  transport: defaultTransport,
  setTransport: (p) => set((s) => ({ transport: { ...s.transport, ...p } })),
  report: null,
  setReport: (r) => set({ report: r }),
}));