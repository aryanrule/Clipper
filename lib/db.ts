
// supabase connection 

import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANNON_KEY = process.env.SUPABASE_ANNON_KEY;

if(!SUPABASE_URL || !SUPABASE_ANNON_KEY){
    throw new Error('SUPABASE_URL or SUPABASE_ANNON_KEY  is not set in .env file');
}

export const supabase = createClient(
    SUPABASE_URL , 
    SUPABASE_ANNON_KEY 
);


  