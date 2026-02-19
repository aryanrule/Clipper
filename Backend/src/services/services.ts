
import { Request ,Response } from "express"
import path from "path"
import fs from "fs";
import { spawn } from "child_process";
import { unique } from "next/dist/build/utils";
import { getSupabase } from "../database/supabase";
const uploadPath = path.resolve(__dirname , '../uploads');
const Bucket = process.env.SUPABASE_BUCKET; 
const supabase = getSupabase();

interface jobsStatus {
    id : string , 
    status : string , 
    userId : string  , 
    public_url? : string , 
    storage_path? : string  , 
    file_path?:string , 
    error?:string , 
}

function createJobId () : string {
    return Date.now().toString(36) + Math.random().toString(36);
}

// a little bit leftover
export const getClipFormats = async (req : Request , res : Response) => {
    //  const {url} = req.body;
    const url = "https://www.youtube.com/watch?v=9PXluC2FMD0";  
    if(!url || typeof(url) != "string") {
        return res.status(400).json({
            message:"url is required " ,
            success:false , 
        })
     }

     try {

       //  production cookie  path leftover
       // the tempcookies path is leftover
      const ytDlp_path = path.resolve(__dirname , "../../bin/yt-dlp.exe");
      const ytArgs = [
      '-j', 
      '--no-warnings',
      '--no-check-certificates',
      '--add-header',
      'referer:youtube.com',
      '--add-header',
      'user-agent:Mozilla/5.0',
       url as string
      ];
      
      const timeout = setTimeout(() => {
        console.log("[formats] timeout reached . killing yt-dlp process");
        yt.kill('SIGKILL');
      }, 30000);

      let jsondata = '';
      const yt = spawn(ytDlp_path , ytArgs);
      
      yt.stdout.on('data' , (data) => {
        jsondata += data;
      })
      
      let errordata = '';
      yt.stderr.on('data' , (data) => {
        errordata += data;
      });

      yt.on('close' , (code , signal) => {
          clearTimeout(timeout);
          if(signal === 'SIGKILL'){
              console.error(`[formats] yt-dlp process timed out after 30 seconds`);
              return res.status(500).json({ error: 'Request timed out - video may be too long or unavailable' });
          }
          if(code !== 0){
              console.error(`[formats] yt-dlp exited with code ${code}`, errordata);
              return res.status(500).json({ error: `yt-dlp exited with code ${code}` });
          }

          
          try {
              const MAX_PIXELS = 1920 * 1080;
              const info = JSON.parse(jsondata);   
              const output_path= path.resolve(__dirname , 'output.js');
              console.log(output_path);
              fs.writeFileSync(output_path , JSON.stringify(info.formats , null , 2) , "utf-8");
              // fs.writeFileSync(path.resolve(__dirname , 'output.json') , info.formats);   
              // what i am actually looking for 
              // formatid 
              // label 
              // hasaudio 
              // heigh * width <= maxpixels 
              // ext 

              const videoformats = info.formats.filter((f:any) => 
                  f.vcodec !== 'none' && 
                  f.height && f.width && 
                  (f.width * f.height <= MAX_PIXELS) &&
                  (f.ext === 'mp4' || f.ext === 'webm')
              ).map((f:any) => ({
                  format_id : f.format_id , 
                  label : `${f.height}p${f.fps > 30 ? f.fps :''}` , 
                  hasaudio : f.acodec !== 'none' , 
                  ext : f.ext , 
              })).sort((a:any , b:any) => b.height - a.height);
              console.log("video formats" , videoformats);  
              
              // filter now
              //prefering formats with audio 
              const uniqueFormats = videoformats.reduce((acc:any[] , curr:any) => {
                    const existing = acc.find((item) => item.label === curr.label) ;
                    if(!existing){
                       acc.push(curr);
                    }else if(curr.hasaudio && !existing.hasaudio){
                       const index = acc.findIndex((item) => item.label === curr.label);
                       acc[index] =curr;
                    }
                    return acc;
              } , []);
              console.log(uniqueFormats); 

              const formated_clips = uniqueFormats.map((item: any) => ({
                 format_id : item.hasaudio ? item.format_id : `${item.format_id}+bestaudio`,
                 label : item.label 
              }))
              console.log(formated_clips);
              return res.status(200).json({
                 success:true , 
                 message : "formated clip is ready" , 
                 formats : formated_clips  , 
              })
          }catch(error){
             console.error('[formats] JSON parse error', error);
             return res.status(500).json({ error: 'Failed to parse yt-dlp output'});
          }
      })

     }catch(error : unknown){
        console.log(error); 
     }
}

const dummyData = {
  url: "https://www.youtube.com/watch?v=9PXluC2FMD0",
  startTime: "00:00:00",
  endTime: "00:00:2",
  formatId: "91-0",
  subtitles: true,
  userId: "user_12345"
};


// not focusing currently on production path thing
export const clipVideo = async (req:Request , res : Response) => {
  // const url = "https://www.youtube.com/watch?v=1O0yazhqaxs";
  const {url , startTime , endTime , formatId , subtitles , userId } = dummyData ;
  if(!url || !startTime || !endTime || !formatId){
    return res.status(400).json({
        error :"url , startTime , endTime , formatId is required" 
    })
  }
  const ID = createJobId();
  const initialjobData : jobsStatus = {
      id: ID , 
      status: "pending" , 
      userId : userId
  }
  const outputpath = path.resolve(path.join(uploadPath)  , `clip-${ID}.mp4`);
  console.log("outputpath" , outputpath);
//   const {error : insertError } =await supabase.from('jobs').insert([initialjobData]) ;
//   if(insertError){
//     return res.status(400).json({error:"failed to create a job"});
//   }

  (async() => {
    
    try {
       const section = `*${startTime}-${endTime}`;
       // leaving the prod cookie code 
       // first i need some yt-args very imp to spawn it 
       // spawn it 
       // process the valid validation 
       // do the subtitles stuff 
       // let the ffmpeg handles the rest 
       // after that upload your clip to supabase bucket 
       // get the databack 
       // remove the localpath 
       // update the finaljobstatus 
       // return the id the actuall createJobId
       
       let tempcookiePath :string | null = null;
       const prodCookPath = '/etc/secrets/cookies.txt';
       if(fs.existsSync(prodCookPath)){
          const cookieContent = fs.readFileSync(prodCookPath);
          tempcookiePath = path.join(uploadPath , `cookies-${ID}.txt`);
          fs.writeFileSync(tempcookiePath , cookieContent);
       }

       const ytArgs =  [
        url as string 
       ]
       if(formatId){
         ytArgs.push("-f" , formatId);
       }else {
        ytArgs.push("-f" ,"bv[ext=mp4][vcodec^=avc1][height<=?1080][fps<=?60]+ba[ext=m4a]/best[ext=mp4][vcodec^=avc1][height<=?1080]");
       }

       ytArgs.push(
        "--download-sections" , 
        section , 
        "-o" , 
        outputpath, 
        "--merge-output-format"  , 
        "mp4" , 
        "--no-check-certificates",
        "--no-warnings",
        "--add-header",
        "referer:youtube.com",
        "--add-header",
        "user-agent:Mozilla/5.0",
        "--verbose"
       )

       if(subtitles){
          ytArgs.push(
          "--write-subs",
          "--write-auto-subs",
          "--sub-lang",
          "en",
          "--sub-format",
          "vtt"
          )
       }

       if(tempcookiePath){
          ytArgs.push("--cookies" , tempcookiePath);
       }else {
          const localcookiePath = path.join(__dirname , 'cookie.txt');
          if(fs.existsSync(localcookiePath)){
            ytArgs.push("--cookies" , localcookiePath);
          }
       }
       console.log(`job${ID} starting out the yt-dlp process`)
       const yt = spawn(path.resolve(__dirname , "../../bin/yt-dlp.exe") , ytArgs);
       yt.stderr.on('data', d =>  console.log(`job${ID} with error` ,  d.toString()));
       
       await new Promise<void>((resolve , reject)=>{
          yt.on('close' , (code , signal) => {
              if(code === 0) {
                resolve();
              }else if(code === null){
                reject(new Error(`yt-dlp process is killed with a signal ${signal}`));
              }else {
                reject(new Error(`yt-dlp exited with code ${code}`));
              }
          })
          yt.on('error' , reject);
       });
       const fastpath = path.join(uploadPath , `clip-${ID}-fast.mp4`);  
       const subpath = outputpath.replace(/\.mp4$/ , ".en.vtt");
       const subtitles_exists = fs.readFileSync(subpath); 
       
       
       await new Promise<void>((resolve , reject) => {
           const ffmpegArgs = [
              '-y' , 
              '-i' , outputpath
           ]

             

       })

        // things are got done 
       return res.status(200).json({
            success:true , 
            message : "clipped successfully", 
        })

    }catch(error){
         
        console.log(error);
    }
  })();
};



  