"use strict";
const associations = require('./models/associations');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const api = require('./api');
const auth = require('./auth');
const logger = require('./config/logger');

const app = express();

logger.info('Configuração do middleware Express');
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('combined', { stream: { write: (message) => logger.info(message) } }));

logger.info('Configuração do router');
app.use('/api', api);
app.use('/auth', auth);
app.use('/', auth);

module.exports = app;