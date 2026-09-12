
import exp from 'express';
import { connect } from 'mongoose';
import { config } from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Route imports
import { authApp } from './routes/authRoutes.js';
import { organizationApp } from './routes/organizationRoutes.js';
import { teamApp } from './routes/teamRoutes.js';
import { projectApp } from './routes/projectRoutes.js';
import { milestoneApp } from './routes/milestoneRoutes.js';
import { sprintApp } from './routes/sprintRoutes.js';
import { taskApp } from './routes/taskRoutes.js';
import { issueApp } from './routes/issueRoutes.js';
import { commentApp } from './routes/commentRoutes.js';
import { labelApp } from './routes/labelRoutes.js';
import { attachmentApp } from './routes/attachmentRoutes.js';
import { notificationApp } from './routes/notificationRoutes.js';
import { activityApp } from './routes/activityRoutes.js';

config();

// Express app
const app = exp();

// --------------------------------------------------
// Allowed frontend origins
// --------------------------------------------------

const configuredOrigins = (process.env.FRONTEND_URLS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = [
  'http://localhost:5173',
    'http://127.0.0.1:5173',
  'https://projectmanager-sand.vercel.app/login',
  ...configuredOrigins
];

// --------------------------------------------------
// Middleware
// --------------------------------------------------

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin
      // (Postman, mobile apps, server-to-server requests, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },

    credentials: true,

    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS'
    ],

    allowedHeaders: [
      'Content-Type',
      'Authorization'
    ]
  })
);

app.use(cookieParser());

app.use(exp.json());

app.use(
  exp.urlencoded({
    extended: true
  })
);

// --------------------------------------------------
// Routes
// --------------------------------------------------

app.use('/api/auth', authApp);

app.use('/api/organizations', organizationApp);

app.use('/api/teams', teamApp);

app.use('/api/projects', projectApp);

app.use('/api/milestones', milestoneApp);

app.use('/api/sprints', sprintApp);

app.use('/api/tasks', taskApp);

app.use('/api/issues', issueApp);

app.use('/api/comments', commentApp);

app.use('/api/labels', labelApp);

app.use('/api/attachments', attachmentApp);

app.use('/api/notifications', notificationApp);

app.use('/api/activity', activityApp);

// --------------------------------------------------
// Health check
// --------------------------------------------------

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to ProjectPulse API',
    version: '1.0.0'
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ProjectPulse Server is running healthy',
    timestamp: new Date().toISOString()
  });
});

// --------------------------------------------------
// Port
// --------------------------------------------------

const port = process.env.PORT || 5000;

// --------------------------------------------------
// Database connection
// --------------------------------------------------

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    await connect(process.env.DB_URL);

    isConnected = true;

    console.log('DB connected');
  } catch (err) {
    console.error('DB connection error:', err.message);

    console.error(
      'Continuing without DB connection (development mode). Some features will be unavailable.'
    );
  }
};

// --------------------------------------------------
// Start server
// --------------------------------------------------

const startServer = async () => {
  await connectDB();

  app.listen(port, () => {
    console.log('--------------------------------------------');
    console.log('ProjectPulse Backend');
    console.log(`Server running on port ${port}`);
    console.log(`http://localhost:${port}`);
    console.log(`Health: http://localhost:${port}/api/health`);
    console.log('--------------------------------------------');
  });
};

startServer();

// --------------------------------------------------
// Global error handler
// --------------------------------------------------

app.use((err, req, res, next) => {
  console.error(err);

  const status = err.status || err.statusCode || 500;

  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});
