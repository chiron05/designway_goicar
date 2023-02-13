const { DataTypes } = require('sequelize')
const db = require('../config/db.js')
const Vehicle = require('./Vehicle')
const Vendor = db.define('vendor', {

    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    first_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false
    },
    city_state: {
        type: DataTypes.STRING,
        allowNull: true
    },
    pincode: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        isLowercase: true,
        unique:true
    },
    phone_number: {
        type: DataTypes.STRING,//exceeding int
        allowNull: false,
        unique:true
    },
    alternate_number: {
        type: DataTypes.STRING, //exceeding int
        allowNull: false
    },
    id_proof: {
        type: DataTypes.STRING,
        allowNull: false

    },
    id_no: {
        type: DataTypes.STRING, //can be alphanumberic
        allowNull: false
    },
    address_line1:{
        type: DataTypes.STRING,
        allowNull: true
    },
    billing_city_state:{
        type: DataTypes.STRING,
        allowNull: true
    },
    billing_pincode:{
        type: DataTypes.STRING,
        allowNull: true
    },
    beneficiary_name:{
        type: DataTypes.STRING,
        allowNull: true
    },
    bank_name:{
        type: DataTypes.STRING,
        allowNull: true
    },
    NEFT_ISC_CODE:{
        type: DataTypes.STRING,
        allowNull: true
    },
    ACCOUNT_NO:{
        type: DataTypes.STRING,
        allowNull: true
    },
    ACCOUNT_TYPE:{
        type: DataTypes.STRING,
        allowNull: true
    },
    isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
})



Vendor.sync({
    // alter: true
})
module.exports = Vendor