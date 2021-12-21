'use strict';
require('dotenv').config();
const winston = require('winston');
const log_level = process.env.LOG_LEVEL || 'warning';

const logger = winston.createLogger({
    level: log_level,
    transports: [
        new winston.transports.File({ filename: 'combine.log' }),
        new winston.transports.Console()
    ]
})

module.exports = logger;