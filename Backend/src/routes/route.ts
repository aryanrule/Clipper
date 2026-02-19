

import { Router } from "express";
import { clipVideo, getClipFormats } from "../services/services";

const router = Router();


router.get('/format' , getClipFormats);
router.get('/clip' , clipVideo);   

export default router;



 