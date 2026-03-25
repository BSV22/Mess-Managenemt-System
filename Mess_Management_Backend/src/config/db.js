require('dotenv').config(); // This loads your password from the .env file
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('MessAutomationDB', 'postgres', process.env.DB_PASSWORD, {
    host: 'localhost',
    dialect: 'postgres',
    port: 5432,
    logging: false
});

module.exports = sequelize;