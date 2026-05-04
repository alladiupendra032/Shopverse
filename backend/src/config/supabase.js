const { createClient } = require('@supabase/supabase-js');

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

let supabase = null;

if (url && url.startsWith('http')) {
  supabase = createClient(url, key);
} else {
  console.warn('⚠️  Supabase credentials not set. Add SUPABASE_URL and SUPABASE_ANON_KEY to backend/.env');
}

module.exports = supabase;
