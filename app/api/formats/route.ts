import { NextRequest, NextResponse } from "next/server";




export async function GET(request:NextRequest , response : NextResponse){
    const {searchParams} = new URL(request.url);
    const url = searchParams.get('url');
    if(!url){
        return NextResponse.json({error:"url is required"} , {status : 400});
    }
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:3002';
    console.log("backend url" , backendUrl);  
    try{
         console.log("teri maakiii" , `${backendUrl}/api/formats?url=${url}`)
         const response = await fetch(`${backendUrl}/api/format?url=${encodeURIComponent(url)}`)
         if (!response.ok) {
         const errorData = await response.json().catch(() => ({ error: 'Failed to fetch formats from backend' }));
         return NextResponse.json(errorData, { status: response.status })
        }

        const data = await response.json();
        return NextResponse.json(data);
    }catch(error){
        console.error('Error fetching formats from backend:', error);
       return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}