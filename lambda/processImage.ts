import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { updateThumbnailPath } from './supabase';

const s3 = new S3Client({});

export async function processImage(bucket: string, key: string) {
  const { Body } = await s3.send(
    new GetObjectCommand({ Bucket: bucket, Key: key }),
  );
  const buffer = Buffer.from(await Body!.transformToByteArray());

  const thumbBuffer = await sharp(buffer)
    .resize(300)
    .jpeg({ quality: 70 })
    .toBuffer();

  const thumbKey = toThumbKey(key);
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: thumbKey,
      Body: thumbBuffer,
      ContentType: 'image/jpeg',
    }),
  );

  await updateThumbnailPath(key, thumbKey);
}

function toThumbKey(key: string): string {
  const dot = key.lastIndexOf('.');
  return `${key.slice(0, dot)}_thumb.jpg`;
}
