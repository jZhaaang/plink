import { Router } from 'express';
import { upload, getSignedUrl, remove } from '../controllers/uploadController';
import { requireAuth } from '../middleware/authenticate';
import { requireAccess } from '../middleware/authorize';
import { bulkRemove } from '../controllers/bulkRemove';

const router = Router();

router.post('/upload', requireAuth, requireAccess('write'), upload);
router.get('/url/{*key}', requireAuth, requireAccess('read'), getSignedUrl);
router.delete('/bulk/{*key}', requireAuth, requireAccess('delete'), bulkRemove);
router.delete('/{*key}', requireAuth, requireAccess('delete'), remove);

export default router;
