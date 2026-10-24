import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vqkxtmabmrpkwnzevgwd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxa3h0bWFibXJwa3duemV2Z3dkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIyMzI0ODAsImV4cCI6MjEwNzgwODQ4MH0.NgYzxcvN3HRIDM004TGMeS7Ang0t2yyPbZa14Qn_lR0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
