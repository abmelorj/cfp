'use strict';
require('dotenv').config();
const Sequelize = require('sequelize');
const logger = require('./../config/logger');

const db_name = process.env.DB_NAME || 'dbcfp';
const db_user = process.env.DB_USER || 'root';
const db_pass = process.env.DB_PASS || 'invalid';
const dialect = process.env.DB_DIALECT || 'mariadb';
const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || 3300;
const charset = process.env.DB_CHARSET || 'utf8mb4';
const collate = process.env.DB_COLLATE || 'utf8mb4_swedish_ci';
const logging = (() => {
    if (process.env.DB_LOGGING == null)
        return false
    else
        if (process.env.DB_LOGGING.toUpperCase() == 'TRUE')
            return (msg) => logger.info(msg)
        else
            return false;
})()
const db = new Sequelize(db_name, db_user, db_pass, {
    dialect,
    host,
    port,
    logging,
    define: {
        charset,
        collate
    }
});
// CREATE DATABASE IF NOT EXISTS dbcfp CHARACTER SET = 'utf8mb4' COLLATE = 'utf8mb4_swedish_ci';
// CREATE DATABASE IF NOT EXISTS dbcfpdev CHARACTER SET = 'utf8mb4' COLLATE = 'utf8mb4_swedish_ci';
// CREATE DATABASE IF NOT EXISTS dbcfptest CHARACTER SET = 'utf8mb4' COLLATE = 'utf8mb4_swedish_ci';
module.exports = db;

// Campo criado pelo Sequelize: 
//      Alteração de NOT NULL para NULL não foi realizada como esperado no BD.
//           Necessário usar Sequelize-CLI para realizar Migrations
//           https://sequelize.org/master/manual/migrations.html
//
//      ERROR 1364 (HY000): Field 'version' doesn't have a default value
//          Atualização dos campos createdAt e updatedAt realizada no nivel do Sequelize.
//          Não cria trigger no BD.







