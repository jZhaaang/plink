import dotenv from 'dotenv';
dotenv.config();

const required = [
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_REGION',
  'S3_BUCKET',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_KEY',
  'SUPABASE_JWT_SECRET',
];

for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing required env var: ${key}`);
    process.exit(1);
  }
}

import express from 'express';
import cors from 'cors';
import uploadRoutes from './routes/upload';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/media', uploadRoutes);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`media-service running on port ${PORT}`);
});
