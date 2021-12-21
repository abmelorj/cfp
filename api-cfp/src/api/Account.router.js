'use strict';

const express = require('express');
const accountController = require('../controllers/Account.controller');
const router = express.Router();

router.get('/owner/:id', accountController.listAccountByOwnerId);
router.get('/:id', accountController.getAccountById);
router.delete('/:id', accountController.deleteAccountById);
router.post('/', accountController.addAccount);
router.put('/', accountController.updateAccount);

module.exports = router;