const { DataTypes }=require('sequelize')
const db=require('../config/db.js')
const dropoffDriversBooking = require('./dropoffDriversBooking.model.js')

const DropCustomer=db.define('dropcustomer',{
    _id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false
    },
    booking_id: {
        type: DataTypes.UUID,
        unique:true
    },
    driver: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fuel_km:{
        type: DataTypes.INTEGER,
        allowNull:false,
        defaultValue:0
    },
    fuel_tank:{
        type: DataTypes.INTEGER,
        allowNull:false,
        defaultValue:0
    },
    vehicle_condition: {
        type: DataTypes.STRING,
        allowNull: false
    },
    video: {
        type: DataTypes.STRING,
    },
    video_id: {
        type: DataTypes.STRING,
    },
    verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    status:{
        type:DataTypes.STRING,
        defaultValue:'Upcoming',
        allowNull:false
    },
    isDeleted:{
        type: DataTypes.BOOLEAN,
        defaultValue:false
    }
   
})

DropCustomer.hasMany(dropoffDriversBooking,{
    foreignKey:'dropoff_id',
    onDelete:"CASCADE",
    onUpdate:"CASCADE"
})

DropCustomer.sync({
  
})
module.exports=DropCustomer









