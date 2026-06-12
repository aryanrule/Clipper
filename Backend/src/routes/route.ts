

import { Router } from "express";
import { cleanUpClip, clipVideo, getClipFormats, getClipWithID } from "../services/services";

const router = Router();



console.log("clip routes loaded");


router.get('/format' , getClipFormats);
router.post('/clip', clipVideo);
router.get('/clip/:id' , getClipWithID); 
router.delete('/clip/cleanup/:id' , cleanUpClip);  
export default router;



 
