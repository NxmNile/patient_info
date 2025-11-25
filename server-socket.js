const http = require('http');
const { Server } = require('socket.io');
const PORT = process.env.SOCKET_PORT || 4000;

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Map socket.id -> sessionId (from client) so we can emit form-left on disconnect
// Not persisted; it's ephemeral for presence
const socketSessionMap = new Map();

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('new-patient', (data) => {
    console.log('Received new-patient event:', data?.firstName || '<no-name>');
    // broadcast to all connected clients (including sender)
    io.emit('new-patient', data);
  });

  // Presence events from clients who are filling the form
  socket.on('form-active', (payload) => {
    try {
      if (payload && payload.sessionId) socketSessionMap.set(socket.id, payload.sessionId);
    } catch (e) {}
    // forward to everyone (admin pages will listen)
    io.emit('form-active', payload);
  });

  socket.on('form-inactive', (payload) => {
    try {
      if (payload && payload.sessionId) socketSessionMap.set(socket.id, payload.sessionId);
    } catch (e) {}
    io.emit('form-inactive', payload);
  });

  socket.on('form-left', (payload) => {
    try {
      if (payload && payload.sessionId) socketSessionMap.set(socket.id, payload.sessionId);
    } catch (e) {}
    io.emit('form-left', payload);
  });

  socket.on('disconnect', () => {
    const sessionId = socketSessionMap.get(socket.id);
    if (sessionId) {
      // notify others that this session left
      io.emit('form-left', { sessionId, timestamp: Date.now() });
      socketSessionMap.delete(socket.id);
    }
    console.log('Socket disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Socket server listening on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down socket server...');
  io.close();
  server.close(() => process.exit(0));
});
