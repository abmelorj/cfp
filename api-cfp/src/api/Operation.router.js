'use strict';

const express = require('express');
const operationController = require('../controllers/Operation.controller');
const router = express.Router();

router.post('/credit', operationController.creditOperation);
router.post('/reserv', operationController.reservOperation);
router.post('/transfer', operationController.transferOperation);
router.post('/forecast', operationController.forecastOperation);
router.post('/pay', operationController.payOperation);
router.get('/:id/shalls', operationController.getShallByOperationId);
router.get('/:id', operationController.getOperationById);
router.put('/:id', operationController.updateOperationById);
router.delete('/:id', operationController.deleteOperationById);

module.exports = router;