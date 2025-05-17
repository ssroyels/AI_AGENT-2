import express from 'express';
import morgan from 'morgan';
import connect from './db/db.js';
import userRoutes from './routes/user.routes.js';
import projectRoutes from './routes/project.routes.js';
import aiRoutes from './routes/ai.routes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

connect();

const app = express();

app.use(cors({
  origin: 'https://ai-agent-2-1.onrender.com', // or '*' for all origins (use with caution)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true // if you're using cookies or authorization headers
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Custom basic routes
app.get('/', (req, res) => {
  res.send('AI Agent API is live!');
});

app.get('/register', (req, res) => {
  res.send('Register endpoint placeholder — use POST /users/register instead');
});

// API routes
app.use('/users', userRoutes);
app.use('/projects', projectRoutes);
app.use('/ai', aiRoutes);

export default app;

