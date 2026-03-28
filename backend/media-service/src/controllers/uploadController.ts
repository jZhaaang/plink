import { Response } from 'express';
import {
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl as s3GetSignedUrl } from '@aws-sdk/s3-request-presigner';
import { AuthenticatedRequest } from '../middleware/authenticate';
import { BUCKET, s3 } from '../lib/s3';

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'video/mp4',
  'video/quicktime',
];

export async function upload(req: AuthenticatedRequest, res: Response) {
  try {
    const { key, contentType } = req.body;

    if (!key || !contentType) {
      res.status(400).json({ error: 'key and contentType are required' });
      return;
    }

    if (key.includes('..') || !key.match(/^(profiles|parties|links)\//)) {
      res.status(400).json({ error: 'Invalid key format' });
      return;
    }

    if (!ALLOWED_TYPES.includes(contentType)) {
      res.status(400).json({ error: 'Unsupported file type' });
      return;
    }

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: contentType,
    });

    const signedUrl = await s3GetSignedUrl(s3, command, { expiresIn: 3600 });

    res.json({ uploadUrl: signedUrl, key });
  } catch (err) {
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        event: 'upload_error',
        userId: req.userId,
        key: req.body?.key,
        contentType: req.body?.contentType,
        reason: err instanceof Error ? err.message : 'Unknown error',
      }),
    );
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
}

export async function getSignedUrl(req: AuthenticatedRequest, res: Response) {
  try {
    const key = (req.params.key as string[]).join('/');

    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
    });

    const signedUrl = await s3GetSignedUrl(s3, command, { expiresIn: 3600 });

    res.json({ url: signedUrl });
  } catch (err) {
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        event: 'signed_url_error',
        userId: req.userId,
        key: req.body?.key,
        contentType: req.body?.contentType,
        reason: err instanceof Error ? err.message : 'Unknown error',
      }),
    );
    res.status(500).json({ error: 'Failed to generate signed URL' });
  }
}

export async function getSignedUrlsBatch(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const { linkId, keys } = req.body as { linkId: string; keys: string[] };

    const expectedPrefix = `links/${linkId}`;
    if (keys.length > 100) {
      res.status(400).json({ error: 'Maximum 100 keys per batch' });
      return;
    } else if (!keys.every((k) => k.startsWith(expectedPrefix))) {
      res
        .status(400)
        .json({ error: 'All keys must belong to the specified link' });
      return;
    }

    const results = await Promise.allSettled(
      keys.map(async (key) => {
        const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
        const url = await s3GetSignedUrl(s3, command, { expiresIn: 3600 });
        return { key, url };
      }),
    );

    const urls: Record<string, string> = {};
    const failed: string[] = [];

    for (const [i, result] of results.entries()) {
      if (result.status === 'fulfilled') {
        urls[result.value.key] = result.value.url;
      } else {
        failed.push(keys[i]);
      }
    }

    if (failed.length > 0) {
      console.warn(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          event: 'batch_signed_url_partial_failure',
          userId: req.userId,
          failed,
        }),
      );
    }

    res.json({ urls });
  } catch (err) {
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        event: 'batch_signed_url_error',
        userId: req.userId,
        reason: err instanceof Error ? err.message : 'Unknown error',
      }),
    );
    res.status(500).json({ error: 'Failed to generate signed URLs' });
  }
}

export async function remove(req: AuthenticatedRequest, res: Response) {
  try {
    const key = (req.params.key as string[]).join('/');

    const command = new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    });

    await s3.send(command);

    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        event: 'delete_error',
        userId: req.userId,
        key: req.body?.key,
        contentType: req.body?.contentType,
        reason: err instanceof Error ? err.message : 'Unknown error',
      }),
    );
    res.status(500).json({ error: 'Failed to delete file' });
  }
}
