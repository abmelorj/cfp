'use strict';
const express = require('express');
const router = express.Router();
// caiu em desuso, foi para o /auth
router.get('/', function (req, res) {
    res.status(200).send({ message: 'API-CFP on-line' })
});

module.exports = router;