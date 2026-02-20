import dotenv from "dotenv";
dotenv.config();
import routes from "./routes/route";
import express from "express";
// import { getClipFormats } from "./services/services";
import { getSupabase } from "./database/supabase";
import { error } from "node:console";
import { createClient } from "@supabase/supabase-js";
const app = express();
const PORT = process.env.PORT || 5000;

const supabaseurl = process.env.SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY as string ;       
const supabase = createClient(supabaseurl , supabaseServiceKey  , {
    auth : {persistSession:false}  
    });;

console.log(supabaseurl);
console.log(supabaseServiceKey);  
const initialdata = {
  id:"jbjsbdjbsd" , 
  user_id : "isndnsjnd" , 
  status : "processing"  , 
}


app.get('/dummyInsert' , async (req , res) => {
   const {error : initialerror} = await supabase.from('jobs').insert([initialdata]);
   if(initialerror){
    return res.json({message : "failed to get a data" , initialerror });
  }else {
    return res.json({message : "hovyaa"}); 
  }
})
app.use(express.json());
app.use('/api', routes);
app.get("/", (req, res) => res.send("Server is alive!"));


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`) 
});
