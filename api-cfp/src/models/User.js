'use strict';

const { DataTypes, Model } = require('sequelize');
const db = require('./../database/db');

class User extends Model {

    static async findByEmail(email, transaction) {
        return User.findOne({ where: { email }, transaction })
            .then(user => user, reason => reason)
            .catch(err => err);
    }
}

User.init({
    id: {
        type: DataTypes.INTEGER.ZEROFILL,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: { isEmail: true }
    },
    hash: {
        type: DataTypes.STRING(128),
        allowNull: true
    },
    token: {
        type: DataTypes.STRING(128),
        allowNull: true
    },
    version: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    engine: 'InnoDB',
    sequelize: db,
    modelName: 'User',
    comment: 'Usuário cadastrado no sistema, armazena o hash da credencial e/ou token de acesso.',
    freezeTableName: true,
    timestamps: false
});


module.exports = User;