import dotenv from 'dotenv';
dotenv.config();

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
