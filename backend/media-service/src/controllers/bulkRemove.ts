import { Response } from 'express';
import { ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { AuthenticatedRequest } from '../middleware/authenticate';
import { s3, BUCKET } from '../lib/s3';

export async function bulkRemove(req: AuthenticatedRequest, res: Response) {
  try {
    const prefix = (req.params.key as string[]).join('/');

    const listed = await s3.send(
      new ListObjectsV2Command({ Bucket: BUCKET, Prefix: prefix }),
    );

    const objects = listed.Contents;
    if (!objects || objects.length === 0) {
      res.json({ deleted: 0 });
      return;
    }

    await s3.send(
      new DeleteObjectsCommand({
        Bucket: BUCKET,
        Delete: {
          Objects: objects.map((o) => ({ Key: o.Key })),
          Quiet: true,
        },
      }),
    );

    res.json({ deleted: objects.length });
  } catch (err) {
    console.error('Bulk delete error', err);
    res.status(500).json({ error: 'Failed to bulk delete' });
  }
}
