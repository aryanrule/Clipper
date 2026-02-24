
import { createClient } from "@supabase/supabase-js";
const supabaseurl = process.env.SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY as string;  
const bucket = process.env.BUCKET || "videos";

if(!supabaseurl || !supabaseServiceKey){
    throw new Error("Supabase credentials are not set in environment variables");
}

export const getSupabase = () => {
    return createClient(supabaseurl , supabaseServiceKey  , {
    auth : {persistSession:false}  
    });
}
 