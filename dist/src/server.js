"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const PORT = process.env.PORT || 3000;
app_1.io.on('connection', (socket) => {
    console.log('New client connected', socket.id);
    socket.on('disconnect', () => {
        console.log('Client disconnected', socket.id);
    });
});
app_1.server.listen(PORT, () => {
    console.log(`Emergency Alert System server running on port ${PORT}`);
    console.log(`Access the application at http://localhost:${PORT}`);
});
