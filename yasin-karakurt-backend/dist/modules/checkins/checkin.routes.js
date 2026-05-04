"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const checkin_controller_1 = require("./checkin.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
// 2. Fotoğraf yüklemek için upload middleware'ini dahil et (yolunu kendi projene göre teyit et)
const upload_middleware_1 = require("../../middleware/upload.middleware");
const router = (0, express_1.Router)();
// Trainer-specific routes
router.get('/trainer', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('TRAINER'), checkin_controller_1.getAllForTrainer);
router.patch('/:id/review', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('TRAINER'), checkin_controller_1.reviewCheckin);
// Danışan (Client) için POST rotası - EKSİK OLAN BUYDU!
// "photos" frontend'den gelen formData'daki key adıyla aynı olmalı.
router.post('/', auth_middleware_1.authenticate, upload_middleware_1.upload.array('photos', 5), checkin_controller_1.createCheckin);
// General routes
router.get('/', checkin_controller_1.getAllCheckins);
router.get('/:id', checkin_controller_1.getCheckinById);
router.patch('/:id/status', checkin_controller_1.updateCheckinStatus);
exports.default = router;
