import { createClient } from '@supabase/supabase-js';

// ضع الروابط التي نسختها سابقاً هنا مباشرة بين علامات الاقتباس
const supabaseUrl = 'https://rhhjllcefkygehdysnnk.supabase.co'; 
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoaGpsbGNlZmt5Z2VoZHlzbm5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMTY3NjEsImV4cCI6MjA4NTc5Mjc2MX0.EB-2vybADgiB9zkJhaiDDds_ay1bL6qPswRW9K23A6U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);