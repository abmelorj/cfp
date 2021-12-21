'use strict';

const express = require('express');
const accessruleController = require('../controllers/AccessRule.controller');
const router = express.Router();

router.get('/:id', accessruleController.getAccessRuleById);
router.get('/', accessruleController.listAccessRules);

module.exports = router;