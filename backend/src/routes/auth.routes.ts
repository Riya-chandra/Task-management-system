// ============================================================
// Auth Routes — /auth/*
// ============================================================

import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { registerValidator, loginValidator, validate } from '../middlewares/validation.middleware';

const router = Router();

router.post('/register', registerValidator, validate, AuthController.register);
router.post('/login',    loginValidator,    validate, AuthController.login);
router.post('/refresh',                               AuthController.refresh);
router.post('/logout',                                AuthController.logout);
router.get('/me',        authenticate,                AuthController.me);

export default router;
