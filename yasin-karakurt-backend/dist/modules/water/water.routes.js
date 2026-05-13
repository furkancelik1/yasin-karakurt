"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const water_controller_1 = require("./water.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post('/log', auth_middleware_1.authenticate, water_controller_1.logWater);
router.get('/today', auth_middleware_1.authenticate, water_controller_1.getTodayWater);
exports.default = router;
