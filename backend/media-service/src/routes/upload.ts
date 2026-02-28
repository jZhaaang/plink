import { Router } from 'express';
import { upload, getSignedUrl, remove } from '../controllers/uploadController';

const router = Router();

router.post('/upload', upload);
router.get('/url/*key', getSignedUrl);
router.delete('/*key', remove);

export default router;
