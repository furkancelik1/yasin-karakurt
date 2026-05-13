"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const database_1 = __importDefault(require("./config/database"));
const socket_1 = require("./socket");
const http_1 = require("http");
const start = async () => {
    try {
        await database_1.default.$connect();
        console.log('PostgreSQL bağlantısı kuruldu');
        const httpServer = (0, http_1.createServer)(app_1.default);
        (0, socket_1.initSocket)(httpServer);
        httpServer.listen(env_1.env.PORT, () => {
            console.log(`[${env_1.env.NODE_ENV}] Server http://localhost:${env_1.env.PORT} adresinde çalışıyor`);
            console.log(`API: http://localhost:${env_1.env.PORT}/api/v1`);
            console.log(`Socket.io: http://localhost:${env_1.env.PORT}`);
        });
    }
    catch (err) {
        console.error('Sunucu başlatılamadı:', err);
        process.exit(1);
    }
};
process.on('SIGTERM', async () => {
    await database_1.default.$disconnect();
    process.exit(0);
});
start();
