'use strict';

const express = require('express');
const router = express.Router();
const shallController = require('../controllers/Shall.controller');

router.get('/:id/payment', shallController.getPaymentByShallId);
router.put('/:id/payup', shallController.payUpShallById);
router.get('/:id', shallController.getShallById);
router.put('/:id', shallController.updateShallById);

module.exports = router;