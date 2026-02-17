
import { Request ,Response } from "express"
import path from "path"
import fs from "fs";
import { spawn } from "child_process";
  
const uploadDir = path.resolve(__dirname , "../../uploads");



export const getClipFormats = async (req : Request , res : Response) => {
    //  const {url} = req.body;
    const url = "https://www.youtube.com/watch?v=RVcMzqMLg_w";
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
              const info = JSON.parse(jsondata);   
              const output_path= path.resolve(__dirname , 'output.js');
              console.log(output_path);
              fs.writeFileSync(output_path , JSON.stringify(info.formats , null , 2) , "utf-8");
              // fs.writeFileSync(path.resolve(__dirname , 'output.json') , info.formats);   
              return res.status(200).json({
                 success:true , 
                 message : "formated clip is ready" , 
                 formats : info.formats , 
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
  