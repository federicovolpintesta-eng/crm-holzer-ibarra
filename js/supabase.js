import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://mvqvzlqtlvigxvwcqgma.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12cXZ6bHF0bHZpZ3h2d2NxZ21hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3MTU3MjYsImV4cCI6MjA5NDI5MTcyNn0.dA-6Tg-bbEYzyxqswx33FtOCOktvSrp9TUoI144gEjU";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});
