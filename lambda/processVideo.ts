import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { execSync } from 'child_process';
import { writeFileSync, readFileSync, mkdirSync } from 'fs';
import { updateThumbnailPath } from './supabase';

const s3 = new S3Client({});

export async function processVideo(bucket: string, key: string) {
  const tmpDir = '/tmp/video-thumb';
  const inputPath = `${tmpDir}/input`;
  const outputPath = `${tmpDir}/output.jpg`;
  mkdirSync(tmpDir, { recursive: true });

  const { Body } = await s3.send(
    new GetObjectCommand({ Bucket: bucket, Key: key }),
  );
  writeFileSync(inputPath, Buffer.from(await Body!.transformToByteArray()));

  try {
    execSync(
      `/opt/bin/ffmpeg -i ${inputPath} -ss 1 -vframes 1 -vf scale=300:-1 ${outputPath} -y`,
      { stdio: 'pipe' },
    );
  } catch {
    execSync(
      `/opt/bin/ffmpeg -i ${inputPath} -vframes 1 -vf scale=300:-1 ${outputPath} -y`,
      { stdio: 'pipe' },
    );
  }

  const thumbKey = toThumbKey(key);
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: thumbKey,
      Body: readFileSync(outputPath),
      ContentType: 'image/jpeg',
    }),
  );

  await updateThumbnailPath(key, thumbKey);
}

function toThumbKey(key: string): string {
  const dot = key.lastIndexOf('.');
  return `${key.slice(0, dot)}_thumb.jpg`;
}
