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
    full_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false
    },
    city: {
        type: DataTypes.STRING,
        allowNull: false
    },
    state: {
        type: DataTypes.STRING,
        allowNull: false
    },
    pincode: {
        type: DataTypes.INTEGER,
        allowNull: false
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
        allowNull: false,

    },
    id_no: {
        type: DataTypes.STRING, //can be alphanumberic
        allowNull: false,
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