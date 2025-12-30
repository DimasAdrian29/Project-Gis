// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ofnftvsliwcpsydrjhci.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mbmZ0dnNsaXdjcHN5ZHJqaGNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3NzQ3MDksImV4cCI6MjA4MTM1MDcwOX0.P6y5-_77uMMxzL8rw0-i9d2gGd27eY71tRZ8VoM9Dz4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)