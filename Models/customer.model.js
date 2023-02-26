const { DataTypes } = require('sequelize')
const db = require('../config/db.js');
const shortUrl = require('./shortUrl.model.js');

const Customer = db.define('customer', {

    _id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: { args: true, msg: "You must enter Phone Number" },
            isInt: { args: true, msg: "You must enter Phone Number" }
        }
    },
    alternate_number: {
        type: DataTypes.STRING,
        defaultValue:'000000000000'
    },
    idNumber: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    driving_license:{
        type: DataTypes.STRING,
        allowNull: false
    },
    validUntil: {
        type: DataTypes.DATE,
        allowNull: false
    },
    idProof: {
        type: DataTypes.STRING,
        allowNull: false
    },
    id_front:{
        type: DataTypes.STRING,
        allowNull: false
    },
    id_back:{
        type: DataTypes.STRING,
        allowNull: false
    },
    isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }

})



Customer.sync({
    // alter:true
})
module.exports = Customer













