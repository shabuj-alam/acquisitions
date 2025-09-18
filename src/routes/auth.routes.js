import express from 'express';
import {signUpController} from "#controllers/auth.controller.js";

const router = express.Router();

router.post('/sign-up', signUpController);
router.post('/sign-in', (req, res) => {
    res.send('POST /api/auth/sign-in response');
})

router.post('/sign-out', (req, res) => {
    res.send('POST /api/auth/sign-out response');
})

export default router;