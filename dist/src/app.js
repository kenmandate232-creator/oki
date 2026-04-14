"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userModel = exports.io = exports.server = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const User_1 = require("../models/User");
const qrServices_1 = require("../services/qrServices");
const notificationService_1 = require("./services/notificationService");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
const server = http_1.default.createServer(app);
exports.server = server;
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
exports.io = io;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(process.cwd(), 'Public')));
app.use('/qrcodes', express_1.default.static(path_1.default.join(process.cwd(), 'Public', 'qrcodes')));
const userModel = new User_1.UserModel();
exports.userModel = userModel;
const qrService = new qrServices_1.QRService();
const notificationService = new notificationService_1.NotificationService();
// Sign-up endpoint
app.post('/api/signup', async (req, res) => {
    try {
        let { name, parentsName, parentsEmail, parentsContact } = req.body;
        // Provide default values if fields are empty
        name = name || 'User ' + Math.random().toString(36).substr(2, 9);
        parentsName = parentsName || 'Parent';
        parentsEmail = parentsEmail || 'noemail@example.com';
        parentsContact = parentsContact || '+1000000000';
        const user = userModel.create({
            name,
            parentsName,
            parentsEmail,
            parentsContact
        });
        const qrData = qrService.createQRData(user.id);
        const qrCodeUrl = await qrService.generateQRCode(qrData, `${user.id}.png`);
        const updatedUser = { ...user, qrCodeUrl };
        userModel.users.set(user.id, updatedUser);
        res.json({
            success: true,
            user: updatedUser,
            message: 'Emergency sign-up successful! QR code generated.'
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create user' });
    }
});
// Get user by ID (QR scan endpoint)
app.get('/api/user/:id', (req, res) => {
    const user = userModel.findById(req.params.id);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
});
// Send emergency alert
app.post('/api/alert/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const alert = {
            userId: user.id,
            userName: user.name,
            parentsName: user.parentsName,
            parentsEmail: user.parentsEmail,
            parentsContact: user.parentsContact,
            timestamp: new Date(),
            alertType: 'emergency'
        };
        // Send notifications
        await notificationService.sendEmailAlert(alert);
        await notificationService.sendSMSAlert(user.parentsContact, `EMERGENCY: ${user.name} needs help! Contact immediately.`);
        // Broadcast to connected devices
        io.emit('emergencyAlert', alert);
        res.json({ success: true, message: 'Emergency alert sent!' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to send alert' });
    }
});
// Serve QR scan page
app.get('/scan/:id', (req, res) => {
    res.sendFile(path_1.default.join(process.cwd(), 'Public', 'index.html'));
});
