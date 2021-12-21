'use strict';

const express = require('express');
const categoryController = require('../controllers/Category.controller');
const router = express.Router();

router.get('/:id/accounts', categoryController.listAccountByCategoryId);
router.get('/owner/:id', categoryController.listCategoryByOwnerId);
router.get('/:id', categoryController.getCategoryById);
router.delete('/:id', categoryController.deleteCategory);
router.put('/', categoryController.updateCategory);
router.post('/', categoryController.addCategory);

module.exports = router;