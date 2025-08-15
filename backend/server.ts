// backend/server.ts
import 'dotenv/config';
import express, { Express } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import connectDB from './config/db';
import authRoutes from './routes/auth';
import postRoutes from './routes/posts';
import resourceRoutes from './routes/resources';
import bookmarkRoutes from './routes/bookmarks';
import analyticsRoutes from './routes/analytics';
import rateLimit from './middleware/rateLimitMiddleware';
import checkBlocked from './middleware/securityMiddleware';
import cookieParser from 'cookie-parser';

const app: Express = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const redisClient = createClient({ 
    url: process.env.REDIS_URI,
    socket: {
        tls:true,
        rejectUnauthorized:false
    }
 });
redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});
redisClient.on('connect',()=>{
    console.log('Redis connected')
})
redisClient.connect();

app.use(cookieParser());
app.use(express.json());
app.use(checkBlocked);
app.use(rateLimit);

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/analytics', analyticsRoutes);

io.on('connection', (socket) => {
  console.log('User connected');
  socket.on('chatMessage', async (msg: { user: string; text: string }) => {
    await redisClient.lPush('chatMessages', JSON.stringify(msg)); // Ephemeral, no expire set for simplicity
    io.emit('message', msg);
  });
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));


export { app };