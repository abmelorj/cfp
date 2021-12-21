'use strict';
const { DataTypes } = require('sequelize');
const AccessGrant = require('./AccessGrant');
const AccessRule = require('./AccessRule');
const Account = require('./Account');
const Category = require('./Category');
const User = require('./User');

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
})

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
})

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
})

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
})

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
})