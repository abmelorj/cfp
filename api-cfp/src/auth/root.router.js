'use strict';
const express = require('express');
const router = express.Router();

router.get('/', function (req, res) {
    res.status(200).send({ message: 'API-CFP on-line' })
});

module.exports = router;