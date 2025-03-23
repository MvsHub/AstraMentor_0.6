import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Usar as credenciais fornecidas
const supabaseUrl = "https://zgscpynpnsssgdgogzne.supabase.co"
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpnc2NweW5wbnNzc2dkZ29nem5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzNTA5MzMsImV4cCI6MjA1NzkyNjkzM30.IE2hZqZ-tp9iDDFRxac3SGOLNvEVZVrMON9Y4qQUyxw"

// Criar e exportar o cliente do Supabase
export const supabase = createClient<Database>(supabaseUrl, supabaseKey)

