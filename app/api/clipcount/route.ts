import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";


export async function POST(request: NextRequest) {

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

    console.log("this is the currentUser" , user);  

    // get current clip count
    const { data: userData, error: fetchError } = await supabase
    .from("users")
    .select("curr_clips")
    .eq("id", user.id)
    .single();

    console.log("userData" , userData); // why null 


    if (fetchError) {
      return NextResponse.json(
        {
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }


    // update count
    const { data, error: updateError } = await supabase
    .from("users")
    .update({
      curr_clips : userData.curr_clips + 1,
    })
    .eq("id", user.id)
    .select()
    .single();


  if (updateError) {
    return NextResponse.json(
      {
        message: "Failed to update clip count",
      },
      {
        status: 500,
      }
    );
  }


  return NextResponse.json({
    message: "Clip count updated",
    data,
  });
}