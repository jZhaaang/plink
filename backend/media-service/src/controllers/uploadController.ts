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

    if (key.includes('..') || !key.match(/^(parties|links)\//)) {
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

    const signedUrl = await s3GetSignedUrl(s3, command, { expiresIn: 300 });

    res.json({ uploadUrl: signedUrl, key });
  } catch (err) {
    console.error('Upload error', err);
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

    const signedUrl = await s3GetSignedUrl(s3, command, { expiresIn: 300 });

    res.json({ url: signedUrl });
  } catch (err) {
    console.error('Signed URL error', err);
    res.status(500).json({ error: 'Failed to generate signed URL' });
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
    console.error('Delete error', err);
    res.status(500).json({ error: 'Failed to delete file' });
  }
}
