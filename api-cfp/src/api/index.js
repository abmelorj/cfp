'use strict';

const express = require('express');
const accessGrantRouter = require('./AccessGrant.router');
const accessRuleRouter = require('./AccessRule.router');
const accountRouter = require('./Account.router');
const categoryRouter = require('./Category.router');
const operationRouter = require('./Operation.router');
const operationTypeRouter = require('./OperationType.router');
const paymentRouter = require('./Payment.router');
const shallRouter = require('./Shall.router');
const rootRouter = require('./root.router');
const securityLayer = require('./SecurityLayer')
const userRouter = require('./User.router');

const router = express.Router();
router.use(securityLayer);

router.use('/accessgrants', accessGrantRouter);
router.use('/accessrules', accessRuleRouter);
router.use('/accounts', accountRouter);
router.use('/categories', categoryRouter);
router.use('/operationtypes', operationTypeRouter);
router.use('/operations', operationRouter);
router.use('/payments', paymentRouter);
router.use('/shalls', shallRouter);
router.use('/users', userRouter);
router.use('/', rootRouter);

module.exports = router;