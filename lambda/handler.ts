import { S3Event } from 'aws-lambda';
import {
  S3Client,
  HeadObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { processImage } from './processImage';
import { processVideo } from './processVideo';
import { getLinkBannerPath, setLinkBanner } from './supabase';
import sharp from 'sharp';

const s3 = new S3Client({});
const BUCKET = process.env.MEDIA_BUCKET!;

export async function handler(event: S3Event) {
  for (const record of event.Records) {
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

    if (key.includes('_thumb') || key.includes('/banner.')) continue;

    // links/{linkId}/posts/{postId}/{uuid}.ext
    const match = key.match(/^links\/([^/]+)\/posts\/([^/]+)\//);
    if (!match) continue;

    const linkId = match[1];

    const { ContentType } = await s3.send(
      new HeadObjectCommand({ Bucket: BUCKET, Key: key }),
    );
    const contentType = ContentType ?? '';

    if (contentType.startsWith('image/')) {
      await processImage(BUCKET, key);
    } else if (contentType.startsWith('video/')) {
      await processVideo(BUCKET, key);
    }

    await maybeSetBanner(linkId, key, contentType);
  }
}

async function maybeSetBanner(
  linkId: string,
  key: string,
  contentType: string,
) {
  if (!contentType.startsWith('image/')) return;

  const existingBanner = await getLinkBannerPath(linkId);
  if (existingBanner) return;

  const { Body } = await s3.send(
    new GetObjectCommand({ Bucket: BUCKET, Key: key }),
  );
  const buffer = Buffer.from(await Body!.transformToByteArray());

  const bannerBuffer = await sharp(buffer)
    .resize(1200, 400, { fit: 'cover' })
    .jpeg({ quality: 80 })
    .toBuffer();

  const bannerKey = `links/${linkId}/banner.jpg`;
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: bannerKey,
      Body: bannerBuffer,
      ContentType: 'image/jpeg',
    }),
  );

  await setLinkBanner(linkId, bannerKey);
}
