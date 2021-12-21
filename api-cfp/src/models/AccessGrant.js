'use strict';

const { Model, DataTypes, Sequelize } = require('sequelize');
const db = require('./../database/db');

class AccessGrant extends Model {

    static async findByOwnerId(agOwnerId) {
        return AccessGrant.findAll({
            where: { agOwnerId, endDate: null },
            include: ['agAccessRule', 'agOwner', 'agGrantedUser']
        })
            .then(grants => grants, reason => reason)
            .catch(err => err);
    }

    static async findByGrantedUserId(agGrantedUserId) {
        return AccessGrant.findAll({
            where: { agGrantedUserId, endDate: null },
            include: ['agAccessRule', 'agOwner', 'agGrantedUser']
        })
            .then(granted => granted, reason => reason)
            .catch(err => err);
    }

    static async findGrantByIds(agOwnerId, agGrantedUserId, agAccessRuleId) {
        return AccessGrant.findAll({
            where: { agOwnerId, agGrantedUserId, agAccessRuleId, endDate: null }
        })
            .then(granted => granted, reason => reason)
            .catch(err => err);
    }


    static getUserProfileInOwnerCFP(agGrantedUserId, agOwnerId) {
        return new Promise(async (resolve, reject) => {
            await AccessGrant.findOne({
                attributes: [[Sequelize.fn('min', Sequelize.col('agAccessRuleId')), 'agAccessRuleId']],
                where: { agGrantedUserId, agOwnerId, endDate: null }
            })
                // agAccessRuleId   Perfil
                //              1 = Proprietário
                //              2 = Coautor
                //              3 = Editor
                //              4 = Auditor
                // Se não tiver acesso retorna 9 que é maior que o acesso de Auditor que é 4
                .then(profile => resolve(profile.agAccessRuleId != null ? profile.agAccessRuleId : 9)
                    , reason => reject(reason))
                .catch(err => reject(err));
        })
    }
}

AccessGrant.init({
    id: {
        type: DataTypes.INTEGER.ZEROFILL,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_DATE')
    },
    endDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    version: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    engine: 'InnoDB',
    sequelize: db,
    modelName: 'AccessGrant',
    comment: 'Cada pessoa registrada no sistema automaticamente recebe o acesso de proprietário do controle financeiro que criar. Este registro servirá para indicar quando começou a utilizar o controle financeiro pessoal. Nesta entidade o proprietário poderá registrar concessão e revogação de acesso para outras pessoas ao seu controle financeiro conforme os tipos pré-definidos em AccessRule.',
    freezeTableName: true,
    timestamps: false
});


module.exports = AccessGrant;