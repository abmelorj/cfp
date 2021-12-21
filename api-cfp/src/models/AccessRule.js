'use strict';

const { DataTypes, Model } = require('sequelize');
const db = require('./../database/db');

class AccessRule extends Model {
    static isOwner(ruleId) { return ruleId <= 1 ? true : false }
    static isCoauthor(ruleId) { return ruleId <= 2 ? true : false }
    static isEditor(ruleId) { return ruleId <= 3 ? true : false }
    static isAuditor(ruleId) { return ruleId <= 4 ? true : false }
}

AccessRule.init({
    id: {
        type: DataTypes.DECIMAL(2).ZEROFILL,
        autoIncrement: false,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    description: {
        type: DataTypes.STRING(100),
        allowNull: false
    }
}, {
    engine: 'InnoDB',
    sequelize: db,
    modelName: 'AccessRule',
    comment: 'Define os quatro papéis utilizados pelo controle de acesso suportados pelo sistema: proprietário, coautor, editor e auditor.',
    freezeTableName: true,
    timestamps: false
});

module.exports = AccessRule;