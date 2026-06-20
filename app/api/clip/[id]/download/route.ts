import { NextRequest, NextResponse } from "next/server";


export async function GET(request : NextRequest , {params} : {params : Promise<{id:string}>}){
    try {
      const {id} = await params;
      const backend_url = process.env.BACKEND_API_URL;
      const statusRes = await fetch(`${backend_url}/api/clip/${id}`);

      if(!statusRes.ok){
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      }

      const jobData = await statusRes.json();
      if(jobData.status !== "completed" || !jobData.url){
        return NextResponse.json({ error: 'Job not ready' }, { status: 409 });
      }

      const downloadRes = await fetch(jobData.url);
      if(!downloadRes.ok){
      return NextResponse.json({ error: 'Failed to download from Supabase' }, { status: 500 });
      }
        const blob = await downloadRes.blob();
      
        try{
          const cleanUpRes = await fetch(`${request.nextUrl.origin}/api/clip/${id}/cleanup` , {method:'DELETE'});
          
          if (!cleanUpRes.ok) {
            console.warn(`Failed to clean up job ${id}:`, await cleanUpRes.text());
          } else {
            console.log(`Successfully cleaned up job ${id}`);
          }

        }catch(cleanupErr){
          console.error(`Cleanup error for job ${id}:`, cleanupErr); 
        }

        return new NextResponse(blob, {
         headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': 'attachment; filename="clip.mp4"',
        },
    });

    }catch(error){
         console.error('Download route error:', error);
         return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}