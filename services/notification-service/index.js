const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const redisAdapter = require('socket.io-redis');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3004;
const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';


io.adapter(redisAdapter(REDIS_URL));


io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);


  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});


app.post('/notify', (req, res) => {
  const { userId, itineraryId, type, payload } = req.body;
  if (!userId) return res.status(400).json({ error: 'missing userId' });

  io.to(userId).emit('alert', { itineraryId, type, payload });
  res.json({ ok: true });
});

server.listen(PORT, () => console.log(`notification-service listening on ${PORT}`));