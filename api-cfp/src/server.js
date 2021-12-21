'use strict';

require('dotenv').config();
const app = require('./app');
const logger = require('./config/logger');

const port = process.env.PORT || 3200;

app.listen(port, () => {
    logger.info(`API-CFP listening on port: ${port} (CTRL+C to abort)`);
});