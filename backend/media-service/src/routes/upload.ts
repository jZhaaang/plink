import { Router } from 'express';
import { upload, getSignedUrl, remove } from '../controllers/uploadController';
import { requireAuth } from '../middleware/authenticate';

const router = Router();

router.post('/upload', requireAuth, upload);
router.get('/url/*key', requireAuth, getSignedUrl);
router.delete('/*key', requireAuth, remove);

export default router;
