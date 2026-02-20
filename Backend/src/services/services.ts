
import { Request ,Response } from "express"
import path from "path"
import fs from "fs";
import { spawn } from "child_process";
import { unique } from "next/dist/build/utils";
import { getSupabase } from "../database/supabase";
const uploadPath = path.join(__dirname , '../uploads');

if(!fs.existsSync(uploadPath)){
     fs.mkdirSync(uploadPath);   
}

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

function timeTosecond(timeStr : string):number{
    const parts = timeStr.split(':');
    return parseInt(parts[2]) *3600 + parseInt(parts[1])*60 + parseInt(parts[0])*60; 
}

function secondsToTime(seconds : number) : string{
         const hours = Math.floor(seconds/3600);
         const minutes = Math.floor((seconds%3600)/60);
         const sec = seconds%60;
         return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${sec.toFixed(3).padStart(6, '0')}`;
}

async function subtitlesAdjustment(inputpath:string , outputpath:string , startTime:string):Promise<void>{
      const startseconds = timeTosecond(startTime);
      console.log("time to sec" , startseconds);
      const timestampregex =  /(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})/g;
      const content = await fs.promises.readFile(inputpath , 'utf-8');
      
     const adjustedContent = content.replace(timestampregex, (match, start, end) => {
         const startsec = timeTosecond(start) - startseconds;
         const endsec = timeTosecond(end) - startseconds;

         if(startsec < 0) return match;
         return `${secondsToTime(startsec)} --> ${secondsToTime(endsec)}`;
     });
    
     console.log("i am wriring content in adjustment.vtt");  
    await fs.promises.writeFile(outputpath , adjustedContent , 'utf-8');
}
// a little bit leftover
export const getClipFormats = async (req : Request , res : Response) => {
    //  const {url} = req.body;
    const url = "https://www.youtube.com/watch?v=aOLsQN98aI4";  
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
  url: "https://www.youtube.com/watch?v=aOLsQN98aI4", 
  startTime: "00:00:34", 
  endTime: "00:00:40",
  formatId: "91",
  subtitles: false,  
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
       console.log("fastpath" , fastpath);  
       console.log("outputpath", outputpath);  
       const subpath = outputpath.replace(/\.mp4$/ , ".en.vtt");
       const subtitles_exists = fs.existsSync(subpath); 
       if(subtitles_exists){
         console.log("yes subtitles exists"); 
       }
       
       // adjusting subtitles time stamps 
       if(subtitles && subtitles_exists){
          const adjustedPath = path.join(uploadPath , `clip-${ID}-adjustment.vtt`);
          console.log(adjustedPath);
          await subtitlesAdjustment(subpath , adjustedPath , startTime);
          await fs.promises.rename(adjustedPath , subpath);
          console.log("subpath" , subpath);
          console.log("adjustmentpath" , adjustedPath) 
              
       }
       await new Promise<void>((resolve , reject) => {
           console.log("i am in ")
           const ffmpegArgs = [
              '-y' , 
              '-i' , outputpath // the input actually 
           ]

           console.log("i am at this block  fffmppppppeeeegg starting")  
           
            if (subtitles && subtitles_exists) {
            console.log(`[job ${ID}] burning subtitles from ${subpath}`);
            ffmpegArgs.push(
            '-vf', `subtitles=${subpath}`,
            '-c:v', 'libx264',
            '-c:a', 'aac',
            '-b:a', '128k',
            '-preset', 'ultrafast',  // Faster encoding, less CPU
            '-crf', '28',            // Lower quality but much smaller file
            '-maxrate', '2M',        // Limit bitrate
            '-bufsize', '4M'         // Limit buffer size
            );
        } else {
          // No subtitles to burn – copy video but transcode audio to AAC to ensure MP4 compatibility
          ffmpegArgs.push(
            '-c:v', 'copy', // keep original video
            '-c:a', 'aac',
            '-b:a', '128k'
          );
        }
        ffmpegArgs.push(
          '-movflags', '+faststart',
          fastpath
        );

        console.log(`starting the job${ID} running ffmpeg` , ffmpegArgs.join(' '));
        
        const ff = spawn('ffmpeg' , ffmpegArgs);
        const ffmpegTimeout = setTimeout(()=> {
          console.log(`[job ${ID}] ffmpeg timeout reached, killing process`);
          ff.kill('SIGKILL');
         } , 300000);

           
        ff.stderr.on('data', d => console.error(`[job ${ID}] ffmpeg`, d.toString()));
        ff.on('close' , (code , signal) => {
            clearTimeout(ffmpegTimeout);
            if(code === 0){
                resolve();
            }else if(code === null){
                reject(new Error(`ffmpeg process was killed by signal: ${signal || 'unknown'} - likely due to memory limits on Render`));
            }else {
                reject(new Error(`ffmpeg exited with code ${code}`));
            }
        })
        ff.on('error' , reject);
        })
        // console.log("finaloutputpath" , outputpath);  
        await fs.promises.unlink(outputpath).catch(()=>{});
        await fs.promises.rename(fastpath  , outputpath);
        console.log(fastpath); 
        console.log("saara kaam hpgya hai"); 
      
          
       return res.status(200).json({
            success:true , 
            message : "clipped successfully", 
        })
   
    }catch(error){
         
        console.log(error);
    }
  })();
};



  