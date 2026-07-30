import { createClient } from "@supabase/supabase-js";

// ==============================================================================
// SUPABASE CONFIGURATION
// Replace SUPABASE_URL and SUPABASE_PUBLIC_KEY below with your actual credentials:
// Find them in your Supabase Dashboard -> Project Settings -> API
// ==============================================================================

const rawUrl = (import.meta && import.meta.env && import.meta.env.VITE_SUPABASE_URL) || "https://ozehlwtluuewjxfrnjyh.supabase.co";
const SUPABASE_URL = rawUrl.replace(/\/rest\/v1\/?$/, "");
const SUPABASE_PUBLIC_KEY = (import.meta && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) || "sb_publishable_dzUOrPWdcJZXZGYPD9sUmA_2OnS2YFx";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
