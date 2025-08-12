require('dotenv').config();
require('express-async-errors');
const socketIo = require('socket.io');
const { spawn } = require('child_process');
const http = require('http');
const express = require('express');
const cors = require('cors');
const errorHandlerMiddleware = require('./Middlewares/ErrorHandler');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

app.use(cors());

app.use(express.json());

app.get('/health', (req, res) => res.send('ok'));

app.use(errorHandlerMiddleware);

// Spawn Python worker
const py = spawn('venv/Scripts/python.exe', ['python/worker.py']);

py.stdout.on('data', (data) => {
  try {
    const result = JSON.parse(data.toString());
    const { interviewId, metrics } = result;
    io.to(interviewId).emit('metrics', metrics);
  } catch (err) {
    console.error('Error parsing Python output:', err);
  }
});

py.stderr.on('data', (data) => {
  const msg = data.toString();
  if (msg.toLowerCase().includes('error')) {
    console.error(`Python error: ${msg}`);
  } else {
    console.log(`Python log: ${msg}`);
  }
});

io.on('connection', (socket) => {
  const { interviewId } = socket.handshake.query;
  socket.on('join-room', (roomId) => socket.join(roomId));

  socket.on('video-frames', (data) => {
    py.stdin.write(JSON.stringify(data) + '\n'); // send frame to Python
  });
});

const startApp = async () => {
  try {
    server.listen(5000, () => {
      console.log('server is listening on port 5000');
    });
  } catch (error) {
    console.log(error);
  }
};

startApp();
