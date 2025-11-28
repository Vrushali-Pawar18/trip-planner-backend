"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateToken = (id) => {
    const secret = process.env.JWT_SECRET || 'default_secret';
    const expiresIn = (process.env.JWT_EXPIRES_IN || '30d');
    return jsonwebtoken_1.default.sign({ id }, secret, { expiresIn });
};
exports.default = generateToken;
