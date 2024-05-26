import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { JSON_LIMIT } from './constants.js';
import dotenv from 'dotenv';

dotenv.config({
  path: './.env',
});

const app = express();

app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: JSON_LIMIT }));
app.use(
  express.urlencoded({
    extended: true,
    limit: JSON_LIMIT,
  })
);
app.use(express.static('public'));

// routes
import adminRouter from './routes/admin.routes.js';
import managerRouter from './routes/manager.routes.js';
import memberRouter from './routes/member.routes.js';
import trainerRouter from './routes/trainer.routes.js';

// routes declaration
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/manager', managerRouter);
app.use('/api/v1/member', memberRouter);
app.use('/api/v1/trainer', trainerRouter);

export default app;
