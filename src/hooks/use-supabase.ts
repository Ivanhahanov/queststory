import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useSupabaseClient() {
  return useState(() => createClient())[0];
}
