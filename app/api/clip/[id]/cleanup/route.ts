import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { NextRequest , NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
// target 
// clean the bucket 
// clean the job also


// the error is not able to find the bucket 

export async function DELETE(request : NextRequest , { params }: { params: Promise<{ id: string }> }){
    try {
      const {id} = await params;
      const supabase = createSupabaseAdminClient();
      const bucket = process.env.SUPABASE_BUCKET || "videos";


      console.log(`[cleanup] Verifying access to bucket: ${bucket}`);
      const { data: bucketList, error: bucketError } = await supabase.storage.listBuckets();
      
      if (bucketError) {
        console.error(`[cleanup] Bucket access error:`, bucketError);
        return NextResponse.json({ error: 'Cannot access storage buckets' }, { status: 500 });
      }

      const targetBucket = bucketList?.find(b => b.name === bucket); 
      if (!targetBucket) {
      console.error(`[cleanup] Bucket ${bucket} not found. Available buckets:`, bucketList?.map(b => b.name));
      return NextResponse.json({ error: `Bucket ${bucket} not found` }, { status: 500 });
      }
    
      console.log(`[cleanup] Bucket ${bucket} found and accessible`);
      const backendUrl = process.env.BACKEND_API_URL;
      const statusRes = await fetch(`${backendUrl}/api/clip/${id}`);
      if (!statusRes.ok) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      }

    
      const jobData = await statusRes.json();
      console.log(`[cleanup] Job data for ${id}:`, jobData);

      if (!jobData.storagePath) {
       console.error(`[cleanup] No storagePath found for job ${id}`);
       return NextResponse.json({ error: 'No file to clean up' }, { status: 400 });
      }

      console.log(`[cleanup] Attempting to delete ${jobData.storagePath} from bucket ${bucket}`);
      const { data: deleteData, error: deleteError } = await supabase.storage
      .from(bucket)
      .remove([jobData.storagePath]);
    
    console.log(`[cleanup] Supabase delete response:`, { deleteData, deleteError });
    
    if (deleteError) {
      console.error(`[cleanup] Failed to delete ${jobData.storagePath}:`, deleteError);
      return NextResponse.json({ error: 'Failed to delete file from storage' }, { status: 500 });
    }
    
    console.log(`[cleanup] Supabase delete operation completed. Response data:`, deleteData);
    
    try {
      const { data: verifyData } = await supabase.storage
        .from(bucket)
        .list('', {
          search: jobData.storagePath
        });
      
      console.log(`[cleanup] Verification - files matching ${jobData.storagePath}:`, verifyData);
      
      if (verifyData && verifyData.length > 0) {
        console.error(`[cleanup] File still exists after delete operation!`);
        return NextResponse.json({ error: 'File deletion failed - file still exists' }, { status: 500 });
      } else {
        console.log(`[cleanup] Verification successful - file confirmed deleted`);
      }
    } catch (verifyErr) {
      console.warn(`[cleanup] Verification failed:`, verifyErr);
    }

    try {
      console.log(`[cleanup] Calling backend cleanup for job ${id}`);
      console.log("delete api" , `${backendUrl}/api/clip/${id}/cleanup`)
      const backendCleanupRes = await fetch(`${backendUrl}/api/clip/${id}/cleanup`, {
        method: 'DELETE'
      });
      
      if (!backendCleanupRes.ok) {
        console.warn(`[cleanup] Backend cleanup failed for ${id}:`, await backendCleanupRes.text());
      } else {
        console.log(`[cleanup] Backend cleanup successful for ${id}`);
      }
    } catch (backendCleanupErr) {
      console.warn(`[cleanup] Backend cleanup error for ${id}:`, backendCleanupErr);
    }
    
    return NextResponse.json({ success: true });

    }catch(error){
        
    }
}