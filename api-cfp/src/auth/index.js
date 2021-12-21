'use strict';

const rootRouter = require('./root.router');
const authController = require('../controllers/Auth.controller');

const express = require('express');
const router = express.Router();

router.post(`/signup`, authController.userSignup);
router.post(`/signin`, authController.userSignin);
router.post(`/validate`, authController.validateToken);
router.use(`/`, rootRouter);

module.exports = router;