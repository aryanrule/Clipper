import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

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