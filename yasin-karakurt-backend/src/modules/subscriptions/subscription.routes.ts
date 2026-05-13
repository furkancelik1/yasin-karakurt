import express from 'express';
import * as subController from './subscription.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = express.Router();

const jsonParser = express.json();
const urlencodedParser = express.urlencoded({ extended: true });

router.post('/callback', urlencodedParser, subController.paymentCallback);

router.use(authenticate);

router.get('/my', subController.getMy);
router.post('/initialize', jsonParser, subController.initiate);
router.post('/cancel', jsonParser, subController.cancel);

export default router;