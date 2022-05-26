'use strict';
const { DataTypes } = require('sequelize');
const AccessGrant = require('./AccessGrant');
const AccessRule = require('./AccessRule');
const Account = require('./Account');
const Balance = require('./Balance');
const Category = require('./Category');
const Operation = require('./Operation');
const OperationType = require('./OperationType');
const Payment = require('./Payment');
const PayShall = require('./PayShall');
const Shall = require('./Shall');
const User = require('./User');

// ######################################################################
// ######################################################################
// ####
// ####    A c c e s s G r a n t
// ####
// ######################################################################
// ######################################################################

// ==================================================
// AccessGrant -> AccessRule
// ==================================================
AccessGrant.belongsTo(AccessRule, {
    as: 'agAccessRule',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    foreignKey: {
        name: 'agAccessRuleId',
        type: DataTypes.DECIMAL(2).ZEROFILL,
        allowNull: false
    }
});
AccessRule.hasMany(AccessGrant, {
    as: 'agAccessRule',
    foreignKey: 'agAccessRuleId'
});

// ==================================================
// AccessGrant -> User (Owner)
// ==================================================
AccessGrant.belongsTo(User, {
    as: 'agOwner',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    foreignKey: {
        name: 'agOwnerId',
        type: DataTypes.INTEGER.ZEROFILL,
        allowNull: false
    }
});
User.hasMany(AccessGrant, {
    as: 'agOwner',
    foreignKey: 'agOwnerId'
});

// ==================================================
// AccessGrant -> User (Granted)
// ==================================================
AccessGrant.belongsTo(User, {
    as: 'agGrantedUser',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    foreignKey: {
        name: 'agGrantedUserId',
        type: DataTypes.INTEGER.ZEROFILL,
        allowNull: false
    }
});
User.hasMany(AccessGrant, {
    as: 'agGrantedUser',
    foreignKey: 'agGrantedUserId'
});

// ######################################################################
// ######################################################################
// ####
// ####    C a t e g o r y
// ####
// ######################################################################
// ######################################################################

// ==================================================
// Category -> User (Owner)
// ==================================================
Category.belongsTo(User, {
    as: 'catOwner',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    foreignKey: {
        name: 'catOwnerId',
        type: DataTypes.INTEGER.ZEROFILL,
        allowNull: false
    }
});
User.hasMany(Category, {
    as: 'catOwner',
    foreignKey: 'catOwnerId'
});

// ######################################################################
// ######################################################################
// ####
// ####    A c c o u n t
// ####
// ######################################################################
// ######################################################################

// ==================================================
// Account -> Category
// ==================================================
Account.belongsTo(Category, {
    as: 'accCategory',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    foreignKey: {
        name: 'accCategoryId',
        type: DataTypes.INTEGER.ZEROFILL,
        allowNull: false
    }
});
Category.hasMany(Account, {
    as: 'accCategory',
    foreignKey: 'accCategoryId'
});

// ######################################################################
// ######################################################################
// ####
// ####    B a l a n c e
// ####
// ######################################################################
// ######################################################################

// ==================================================
// Balance -> Account
// ==================================================
Balance.belongsTo(Account, {
    as: 'balAccount',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    foreignKey: {
        name: 'balAccountId',
        type: DataTypes.INTEGER.ZEROFILL,
        allowNull: false,
        unique: 'AccountMonthBalance'
    }
});
Account.hasMany(Balance, {
    as: 'balAccount',
    foreignKey: 'balAccountId'
});

// ######################################################################
// ######################################################################
// ####
// ####    O p e r a t i o n
// ####
// ######################################################################
// ######################################################################

// ==================================================
// Operation -> OperationType
// ==================================================
Operation.belongsTo(OperationType, {
    as: 'oprType',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    foreignKey: {
        name: 'oprTypeId',
        type: DataTypes.DECIMAL(2).ZEROFILL,
        allowNull: false
    }
});
OperationType.hasMany(Operation, {
    as: 'oprType',
    foreignKey: 'oprTypeId'
});

// ==================================================
// Operation -> Account (Source)
// ==================================================
Operation.belongsTo(Account, {
    as: 'oprSourceAccount',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    foreignKey: {
        name: 'oprSourceAccountId',
        type: DataTypes.INTEGER.ZEROFILL,
        allowNull: true
    }
});
Account.hasMany(Operation, {
    as: 'oprSourceAccount',
    foreignKey: 'oprSourceAccountId'
});

// ==================================================
// Operation -> Account (Destiny)
// ==================================================
Operation.belongsTo(Account, {
    as: 'oprDestinyAccount',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    foreignKey: {
        name: 'oprDestinyAccountId',
        type: DataTypes.INTEGER.ZEROFILL,
        allowNull: true
    }
});
Account.hasMany(Operation, {
    as: 'oprDestinyAccount',
    foreignKey: 'oprDestinyAccountId'
});

// ######################################################################
// ######################################################################
// ####
// ####    S h a l l 
// ####
// ######################################################################
// ######################################################################

// ==================================================
// Shall -> Operation
// ==================================================
Shall.belongsTo(Operation, {
    as: 'shaOperation',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    foreignKey: {
        name: 'shaOperationId',
        type: DataTypes.INTEGER.ZEROFILL,
        allowNull: false
    }
});
Operation.hasMany(Shall, {
    as: 'shaOperation',
    foreignKey: 'shaOperationId'
});


// ######################################################################
// ######################################################################
// ####
// ####    P a y m e n t
// ####
// ######################################################################
// ######################################################################

// ==================================================
// Payment -> Account
// ==================================================
Payment.belongsTo(Account, {
    as: 'payDebitAccount',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    foreignKey: {
        name: 'payDebitAccountId',
        type: DataTypes.INTEGER.ZEROFILL,
        allowNull: false
    }
});
Account.hasMany(Payment, {
    as: 'payDebitAccount',
    foreignKey: 'payDebitAccountId'
});


// ######################################################################
// ######################################################################
// ####
// ####    P a y S h a l l
// ####
// ######################################################################
// ######################################################################

// ==================================================
// PayShall -> Shall
// ==================================================
PayShall.belongsTo(Shall, {
    as: 'sha',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    foreignKey: {
        name: 'shallId',
        type: DataTypes.INTEGER.ZEROFILL,
        allowNull: false,
        unique: 'paying'
    }
});
Shall.hasMany(PayShall, {
    as: 'sha',
    foreignKey: 'shallId'
});

// ==================================================
// PayShall -> Payment
// ==================================================
PayShall.belongsTo(Payment, {
    as: 'pay',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    foreignKey: {
        name: 'paymentId',
        type: DataTypes.INTEGER.ZEROFILL,
        allowNull: false,
        unique: 'paying'
    }
});
Payment.hasMany(PayShall, {
    as: 'pay',
    foreignKey: 'paymentId'
});