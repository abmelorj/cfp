'use strict';

const express = require('express');
const accessGrantController = require('../controllers/AccessGrant.controller');
const router = express.Router();

router.get('/:id/granted', accessGrantController.listAccessGrantedByUserId);
router.get('/:id/grants', accessGrantController.listAccessGrantedByOwnerId);
router.delete('/:id', accessGrantController.revokeAccess);
router.post('/', accessGrantController.grantAccess);

module.exports = router;