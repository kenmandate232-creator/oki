"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const uuid_1 = require("uuid");
class UserModel {
    constructor() {
        this.users = new Map();
    }
    create(userData) {
        const id = (0, uuid_1.v4)();
        const createdAt = new Date();
        const User = {
            id,
            ...userData,
            createdAt,
            qrCodeUrl: `/qrcodes/${id}.png`
        };
        this.users.set(id, User);
        return User;
    }
    findById(id) {
        return this.users.get(id);
    }
    getAllUsers() {
        return Array.from(this.users.values());
    }
}
exports.UserModel = UserModel;
