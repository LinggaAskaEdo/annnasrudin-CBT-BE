import express from 'express';
import cors from 'cors';
import winston from './utils/logger.js';
import 'dotenv/config';

import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import guruRoutes from './routes/guruRoutes.js';
import moduleRoutes from './routes/moduleRoutes.js';
import examRoutes from './routes/examRoutes.js';
import siswaRoutes from './routes/siswaRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import path from 'node:path';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Swagger API Documentation
const swaggerDocument = YAML.load(path.join(process.cwd(), 'docs', 'swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Basic Request Logger
app.use((req, res, next) => {
  winston.info(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/guru', guruRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/ujian', examRoutes);
app.use('/api/siswa', siswaRoutes);
app.use('/api/reports', reportRoutes);

// Basic Routes Placeholder
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'CBT API for Siswa SD is running'
  });
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  winston.error(err.stack);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.listen(port, () => {
  winston.info(`Server is running at http://localhost:${port}`);
});

export default app;
