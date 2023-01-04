const { DataTypes } = require('sequelize')
const db = require('../config/db.js')


const addon_Booking = db.define('addon_booking', {
    _id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    booking_id:{
        type: DataTypes.UUID,
        allowNull: false,
        unique:true
    },
    Insurance:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    zero_liability:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    pick_charges:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    drop_charges:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    owh_pickup:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    owh_dropoff:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    fuel:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    tank:{
        type: DataTypes.STRING,
        allowNull: false
    },
    os_rental:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    os_tax:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    discount:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    comments:{
        type: DataTypes.STRING,
        allowNull: false
    },
    isDeleted:{
        type: DataTypes.BOOLEAN,
        defaultValue:false
    }
})



addon_Booking.sync({
    // alter:true
})
module.exports = addon_Booking

