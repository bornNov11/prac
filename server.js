const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

const rooms = new Map();

app.get('/create-room', (req, res) => {
  const roomId = Math.random().toString(36).substring(7);
  rooms.set(roomId, { users: new Set() });
  res.json({ roomId });
});

io.on('connection', (socket) => {
  socket.on('join-room', (roomId) => {
    if (rooms.has(roomId)) {
      socket.join(roomId);
      rooms.get(roomId).users.add(socket.id);
      io.to(roomId).emit('user-joined', Array.from(rooms.get(roomId).users).length);
    }
  });

  socket.on('chat-message', (roomId, message) => {
    io.to(roomId).emit('chat-message', message);
  });

  socket.on('disconnect', () => {
    rooms.forEach((room, roomId) => {
      if (room.users.has(socket.id)) {
        room.users.delete(socket.id);
        io.to(roomId).emit('user-left', Array.from(room.users).length);
      }
    });
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});