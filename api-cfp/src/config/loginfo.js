'use strict';
const logger = require('./logger');
module.exports = function loginfo(msg) {
    logger.info(msg);
    return { message: msg };
}