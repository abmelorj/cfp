'use strict';

const express = require('express');
const operationtypeController = require('../controllers/OperationType.controller');
const router = express.Router();

router.get('/:id', operationtypeController.getOperationTypeById);
router.get('/', operationtypeController.listOperationTypes);

module.exports = router;