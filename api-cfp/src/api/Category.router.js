'use strict';

const express = require('express');
const categoryController = require('../controllers/Category.controller');
const router = express.Router();

router.get('/:id/pendingValue/:yearMonth', categoryController.getCategoryPendingValueByMonth);
router.get('/:id/pendingValue', categoryController.getCategoryPendingValue);
router.get('/:id/balance/:yearMonth', categoryController.getCategoryBalanceByMonth);
router.get('/:id/balance', categoryController.getCategoryBalance);
router.get('/:id/accounts', categoryController.listAccountByCategoryId);
router.get('/owner/:id', categoryController.listCategoryByOwnerId);
router.get('/:id', categoryController.getCategoryById);
router.delete('/:id', categoryController.deleteCategory);
router.put('/', categoryController.updateCategory);
router.post('/', categoryController.addCategory);

module.exports = router;