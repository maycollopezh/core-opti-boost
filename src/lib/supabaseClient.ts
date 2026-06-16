// =====================================================================
// OptiCore AI — Supabase client
// =====================================================================
// Para activar la persistencia real:
// 1. Crea un proyecto en https://supabase.com
// 2. Reemplaza SUPABASE_URL y SUPABASE_ANON_KEY con tus credenciales
// 3. Crea la tabla `simulations` con la siguiente estructura:
//
//    create table public.simulations (
//      id uuid primary key default gen_random_uuid(),
//      created_at timestamptz default now(),
//      company_name text,
//      industry text,
//      inputs jsonb,
//      results jsonb,
//      report text
//    );
// =====================================================================

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const SUPABASE_URL = "YOUR_SUPABASE_URL";
export const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

export const isSupabaseConfigured =
  SUPABASE_URL !== "YOUR_SUPABASE_URL" &&
  SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY";

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export interface SimulationRecord {
  company_name: string;
  industry: string;
  inputs: Record<string, unknown>;
  results: Record<string, unknown>;
  report: string | null;
}

export async function saveSimulation(record: SimulationRecord) {
  if (!supabase) {
    // Modo demo: simulamos la llamada a Supabase
    await new Promise((r) => setTimeout(r, 900));
    return { ok: true, demo: true };
  }
  const { error } = await supabase.from("simulations").insert(record);
  if (error) throw error;
  return { ok: true, demo: false };
}