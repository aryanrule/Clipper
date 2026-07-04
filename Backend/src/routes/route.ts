

import { Router } from "express";
import { cleanUpClip, clipVideo, getClipFormats, getClipWithID } from "../services/services";

const router = Router();



console.log("clip routes loaded");


router.get('/format' , getClipFormats);
router.post('/clip', clipVideo);
router.get('/clip/:id' , getClipWithID); 
router.delete('/clip/:id/cleanup' , cleanUpClip);  
export default router;


// http://localhost:3002/api/clip/mr687pq60.x42mpxhvcj/cleanup
 
