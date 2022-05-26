'use strict';
const service = require('../models/service');
const { Op } = require('sequelize');
const db = require('./../database/db');
const Operation = require('../models/Operation');
const Balance = require('../models/Balance');
const Shall = require('../models/Shall');
const Payment = require('../models/Payment');
const PayShall = require('../models/PayShall');

/********************************************************
 * 
 *******************************************************/
exports.getPaymentByShallId = async function (req, res) {
    res.status(200).send({ message: 'TO-DO' });
}

/********************************************************
 * 
 *******************************************************/
exports.payUpShallById = async function (req, res) {
    res.status(200).send({ message: 'TO-DO' });
}

/********************************************************
 * 
 *******************************************************/
exports.getShallById = async function (req, res) {
    res.status(200).send({ message: 'TO-DO' });
}

/********************************************************
 * 
 *******************************************************/
exports.updateShallById = async function (req, res) {
    res.status(200).send({ message: 'TO-DO' });
}
