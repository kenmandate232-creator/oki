import { app, io, server } from './app';
const PORT = process.env.PORT || 3000;

io.on('connection',(socket) => {
  console.log('New client connected:', socket.id, 'Transport:', socket.conn.transport.name);

  socket.conn.on('upgrade', () => {
    console.log('Socket upgraded to:', socket.conn.transport.name);
  });

  socket.on('disconnect', (reason) => {
    console.log('Client disconnected:', socket.id, 'Reason:', reason);
  });

  socket.on('error', (error) => {
    console.error('Socket error for client:', socket.id, error);
  });
});

server.listen(PORT, () => {
  console.log(`Emergency Alert System server running on port ${PORT}`);
  console.log(`Access the application at http://localhost:${PORT}`);
});
