

import { Router } from "express";
import { getClipFormats } from "../services/services";

const router = Router();


router.get('/format' , getClipFormats);


export default router;



 