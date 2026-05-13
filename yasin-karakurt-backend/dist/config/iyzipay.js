"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.iyzipay = void 0;
const iyzipay_1 = __importDefault(require("iyzipay"));
// DEBUG LOGU: Terminalde ne yazdığına bakacağız
console.log("--- IYZICO CONFIG KONTROL ---");
console.log("API KEY BASLANGICI:", process.env.IYZICO_API_KEY?.substring(0, 12));
console.log("URI:", 'https://sandbox-api.iyzipay.com');
console.log("-----------------------------");
exports.iyzipay = new iyzipay_1.default({
    apiKey: process.env.IYZICO_API_KEY,
    secretKey: process.env.IYZICO_SECRET_KEY,
    uri: 'https://sandbox-api.iyzipay.com'
});
