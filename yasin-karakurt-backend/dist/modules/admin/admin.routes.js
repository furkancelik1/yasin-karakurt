"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("./admin.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post('/clients', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('TRAINER', 'ADMIN'), admin_controller_1.createClient);
exports.default = router;
