const { createClient } = supabase;
const supabaseUrl = 'https://vjjbekqkmrzzvwqpsgdq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqamJla3FrbXJ6enZ3cXBzZ2RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAxNDk2ODQsImV4cCI6MjA0NTcyNTY4NH0.P_ryuQVQou8bB2q9YOoOeqgV38XjJ8hZ2Aov5Z3KCAI';
const _supabase = createClient(supabaseUrl, supabaseKey);

export {_supabase };