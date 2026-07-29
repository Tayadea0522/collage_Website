import { createClient } from "@supabase/supabase-js";

// ==============================================================================
// SUPABASE CONFIGURATION
// Replace SUPABASE_URL and SUPABASE_PUBLIC_KEY below with your actual credentials:
// Find them in your Supabase Dashboard -> Project Settings -> API
// ==============================================================================

const SUPABASE_URL = (import.meta && import.meta.env && import.meta.env.VITE_SUPABASE_URL) || "https://wxexzlbwjmshysjvgsby.supabase.co/rest/v1/";
const SUPABASE_PUBLIC_KEY = (import.meta && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) || "sb_publishable_US1nvzEtJRFs1j7Phyu6rw_hU2pWZic";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
