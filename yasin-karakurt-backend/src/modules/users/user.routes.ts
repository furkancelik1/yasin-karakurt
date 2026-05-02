import express from "express";
import cors from "cors";

// DİKKAT: Dosyamızın adı checkin.routes.ts olsa bile, import ederken SONUNU .js YAPIYORUZ
const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

export default app;