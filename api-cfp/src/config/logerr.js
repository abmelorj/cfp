'use strict';
const logger = require('./logger');
module.exports = function logerr(msg) {
    logger.error(msg);
    return { message: msg };
}