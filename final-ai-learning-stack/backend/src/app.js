import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';
import { env } from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import instructorRoutes from './routes/instructorRoutes.js';
import { sanitizeRequest } from './middleware/sanitizeMiddleware.js';
import { notFound } from './middleware/notFoundMiddleware.js';
import { errorHandler } from './middleware/errorMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'uploads');
mkdirSync(uploadsDir, { recursive: true });

const app = express();
const normalizeOrigin = (origin) => String(origin || '').trim().replace(/\/$/, '');
const allowedOrigins = new Set((env.clientUrls || []).map(normalizeOrigin));

app.use(cors({
	origin: (origin, callback) => {
		if (!origin) return callback(null, true);
		if (allowedOrigins.has(normalizeOrigin(origin))) return callback(null, true);
		return callback(new Error(`CORS blocked for origin: ${origin}`));
	},
	credentials: true,
}));
app.use(express.json());
app.use(sanitizeRequest);
app.use(morgan('dev'));

app.use('/uploads', express.static(uploadsDir));
app.get('/', (req, res) => res.json({ success: true, message: 'AI Learning API running' }));
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/instructor', instructorRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
