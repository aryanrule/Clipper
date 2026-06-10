

import { NextResponse , NextRequest } from "next/server";
import { createSupabaseServerClient } from "./lib/supabase/server-client";


const protectedRoutes = ["/editor"]

export async function proxy(request :NextRequest){
     const supabase = await createSupabaseServerClient();
     const {data :{user}}  = await supabase.auth.getUser();
    
     const isProtected = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route));
   //   console.log("user" , user);
     if(!user &&  isProtected){
        return NextResponse.redirect(new URL("/" , request.url));
     }
}