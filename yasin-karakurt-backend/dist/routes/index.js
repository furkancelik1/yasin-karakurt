"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("../modules/auth/auth.routes"));
const checkin_routes_1 = __importDefault(require("../modules/checkins/checkin.routes"));
const user_routes_1 = __importDefault(require("../modules/users/user.routes"));
const program_routes_1 = __importDefault(require("../modules/programs/program.routes"));
const notification_routes_1 = __importDefault(require("../modules/notifications/notification.routes"));
const nutrition_routes_1 = __importDefault(require("../modules/nutrition/nutrition.routes"));
const water_routes_1 = __importDefault(require("../modules/water/water.routes"));
const admin_routes_1 = __importDefault(require("../modules/admin/admin.routes"));
// YENİ EKLENEN SATIR: Abonelik rotalarını içe aktar
const subscription_routes_1 = __importDefault(require("../modules/subscriptions/subscription.routes"));
const dashboard_controller_1 = require("../modules/dashboard/dashboard.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use('/auth', auth_routes_1.default);
router.use('/checkins', checkin_routes_1.default);
router.use('/users', user_routes_1.default);
router.use('/programs', program_routes_1.default);
router.use('/notifications', notification_routes_1.default);
router.use('/nutrition', nutrition_routes_1.default);
router.use('/water', water_routes_1.default);
router.use('/admin', admin_routes_1.default);
// YENİ EKLENEN SATIR: Gelen istekleri abonelik rotasına yönlendir
router.use('/subscriptions', subscription_routes_1.default);
router.get('/dashboard/stats', auth_middleware_1.authenticate, dashboard_controller_1.getDashboardStats);
exports.default = router;
