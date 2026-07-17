

import { Router } from "express";
import { cleanUpClip, clipVideo, getClipFormats, getClipWithID } from "../services/services";
import { spawn } from "child_process";

const router = Router();



console.log("clip routes loaded");

router.get('/debug' , (req , res) => {
    const yt = spawn("yt-dlp", [
    "--version"
  ]);

  let out = "";
  let err = "";

  yt.stdout.on("data", d => out += d);
  yt.stderr.on("data", d => err += d);

  yt.on("close", () => {
    res.json({
      stdout: out,
      stderr: err
    });
  });
});

router.get('/format' , getClipFormats);
router.post('/clip', clipVideo);
router.get('/clip/:id' , getClipWithID); 
router.delete('/clip/:id/cleanup' , cleanUpClip);  
export default router;


// http://localhost:3002/api/clip/mr687pq60.x42mpxhvcj/cleanup
 
