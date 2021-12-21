'use strict';

const express = require('express');
const userController = require('../controllers/User.controller');
const router = express.Router();

router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUserById);

module.exports = router;