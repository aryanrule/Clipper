

import { Router } from "express";
import { cleanUpClip, clipVideo, getClipFormats, getClipWithID } from "../services/services";
import { spawn } from "child_process";

const router = Router();



console.log("clip routes loaded");

import fs from "fs";
import path from "path";

router.get("/debug", (req, res) => {
  const secretPath = "/etc/secrets/cookies.txt";
  const tempPath = path.join("/tmp", "cookies-debug.txt");

  if (!fs.existsSync(secretPath)) {
    return res.status(500).json({
      error: "Secret cookies file not found",
    });
  }

  // Copy secret file to a writable location
  fs.copyFileSync(secretPath, tempPath);

  const args = [
    "--cookies",
    tempPath,
    "--print",
    "id",
    "https://www.youtube.com/watch?v=lWBj9z2xDDs",
  ];

  console.log("Running:", "yt-dlp", args);

  const yt = spawn("yt-dlp", args);

  let stdout = "";
  let stderr = "";

  yt.stdout.on("data", (d) => {
    stdout += d.toString();
  });

  yt.stderr.on("data", (d) => {
    stderr += d.toString();
  });

  yt.on("close", (code) => {
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }

    res.json({
      exitCode: code,
      stdout,
      stderr,
      args,
    });
  });
});
router.get('/format' , getClipFormats);
router.post('/clip', clipVideo);
router.get('/clip/:id' , getClipWithID); 
router.delete('/clip/:id/cleanup' , cleanUpClip);  
export default router;


// http://localhost:3002/api/clip/mr687pq60.x42mpxhvcj/cleanup
 
