
import { createClient } from "@supabase/supabase-js";
const supabaseurl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY ;
const bucket = process.env.BUCKET || "videos";

console.log("supabaseurl" , supabaseurl);
console.log("supabaserviceUrk" , supabaseServiceKey);  
if(!supabaseurl || !supabaseServiceKey){
    throw new Error("Supabase credentials are not set in environment variables");
}

export const getSupabase = () => {
    return createClient(supabaseurl , supabaseServiceKey  , {
    auth : {persistSession:false}  
    });
}
 