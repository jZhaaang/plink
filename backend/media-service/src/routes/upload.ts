import { Router } from 'express';
import { upload, getSignedUrl, remove } from '../controllers/uploadController';
import { requireAuth } from '../middleware/authenticate';
import { requireAccess } from '../middleware/authorize';

const router = Router();

router.post('/upload', requireAuth, requireAccess('write'), upload);
router.get('/url/{*key}', requireAuth, requireAccess('read'), getSignedUrl);
router.delete('/{*key}', requireAuth, requireAccess('delete'), remove);

export default router;
