import { notFound } from "next/navigation";
import type { PostgrestError } from "@supabase/supabase-js";

/**
 * `.single()` returns `{ data: null }` both when the row genuinely doesn't
 * exist (PGRST116) and when the query itself failed (missing column after an
 * unapplied migration, RLS misconfiguration, etc). Treating both the same way
 * turns real bugs into a silent 404 — this makes the distinction explicit.
 */
export function assertFound<T>(data: T | null, error: PostgrestError | null): asserts data is T {
  if (error && error.code !== "PGRST116") {
    throw new Error(error.message);
  }
  if (!data) notFound();
}
