'use strict';

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/Payment.controller');

router.put('/:id/payup', paymentController.payupPayment);
router.get('/:id/shalls', paymentController.listShallByPaymentId);
router.get('/:id', paymentController.getPaymentById);
router.put('/:id', paymentController.updatePayment);
router.delete('/:id', paymentController.deletePayment);
router.post('/', paymentController.addPayment);

module.exports = router;