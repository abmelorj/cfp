'use strict';

const express = require('express');
const balanceController = require('../controllers/Balance.controller');
const router = express.Router();

router.get('/:ownerId/funds/:yearMonth', balanceController.getMonthFundsByOwnerId);
router.get('/:ownerId/pendings/:yearMonth', balanceController.getMonthPendingsByOwnerId);

module.exports = router;