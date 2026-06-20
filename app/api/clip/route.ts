import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    console.log("user when you hitt" , user);
    if (error || !user) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    // check weather the user is premium and thc count is lesser than equal to 2 if not premium 
    const {data , error : err} = await supabase.from("users").select("*").eq("id" , user.id).single();
    if(err || !data){
      return NextResponse.json("not able to find the id ");
    }
    
    if(data.curr_clips >= 2 && !data.is_premium){
      return NextResponse.json(
        {
          message: "You have reached your free clip limit. Upgrade to premium."
        },
        { status: 403 }
      );
    }

    // console.log("data" , data); 
    const body = await request.json();

    const backend_payload = {
      ...body,
      userId: user.id, // useful if backend needs user info
    };

    console.log("backend_payload", backend_payload);

    if (!backend_payload.url) {
      return NextResponse.json(
        { error: "url field is required" },
        { status: 400 }
      );
    }
    
    const BACKEND_API = `${process.env.BACKEND_API_URL}/api/clip`;
    console.log("backend_api_url" , BACKEND_API);

    const backendRes = await fetch(
      BACKEND_API ,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(backend_payload),
      }
    );


    
    const backendResponse = await backendRes.json();
   
    console.log(
      "response from backend",
      backendResponse
    );

    return NextResponse.json(backendResponse); 
  } catch (error) {
    console.error("Clip API error:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}