require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const connectDB = async () => {
  try {
    if (!process.env.SUPABASE_URL || (!process.env.SUPABASE_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY)) {
      console.warn('⚠️ SUPABASE_URL or SUPABASE_KEY missing in .env file. Please configure them with your Supabase credentials.');
      return;
    }
    const client = supabase || createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { error } = await client.from('users').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      console.log(`ℹ️ Supabase initialized at: ${process.env.SUPABASE_URL} (Notice: ${error.message})`);
    } else {
      console.log(`✅ Supabase Database Connected Successfully!`);
    }
  } catch (error) {
    console.error(`❌ Supabase Connection Error: ${error.message}`);
  }
};

module.exports = { supabase, connectDB };
