const { DataTypes }=require('sequelize')
const db=require('../config/db.js');
const pickupDriversBooking = require('./pickupDriversBooking.model.js');

const PickCustomer=db.define('pickcustomer',{
    _id: {
        // type: DataTypes.INTEGER,
        // autoIncrement: true,
        // primaryKey: true
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
        allowNull:false
    },
    fuel_tank:{
        type: DataTypes.INTEGER,
        allowNull:false
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
    }
    // TODO:- Fuel is pending
    , isDeleted:{
        type: DataTypes.BOOLEAN,
        defaultValue:false
    }

})

PickCustomer.hasMany(pickupDriversBooking,{
    foreignKey:'pickup_id',
    onDelete:"CASCADE",
    onUpdate:"CASCADE"
});

PickCustomer.sync({
    // alter:true
})
module.exports=PickCustomer









