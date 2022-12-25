import { createClient } from "@supabase/supabase-js";

export const superBase = createClient(
    "https://kenimokqbhurdugbsvgs.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtlbmltb2txYmh1cmR1Z2JzdmdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzE0MzUyNjksImV4cCI6MTk4NzAxMTI2OX0.9xRoTvdTOhdMZ6v8_WcorLZqCruCIGWUr2e0iYM-Lok"
)

