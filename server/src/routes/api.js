import express from 'express';
import { checkAndSaveSSL } from '../controllers/certificateController.js';

const router = express.Router();

router.post('/check-ssl', checkAndSaveSSL);

export default router;