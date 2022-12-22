const { DataTypes }=require('sequelize')
const db=require('../config/db.js')
const dropoffDriversBooking = require('./dropoffDriversBooking.model.js')
const pickupDriversBooking = require('./pickupDriversBooking.model.js')

const Driver=db.define('driver',{
   
    id:{
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique:true
    },
    full_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone_number:{
        type: DataTypes.STRING,
        allowNull:false,
        unique:true

    },
    alternate_number:{
        type: DataTypes.STRING,
        allowNull:false,
        unique:true
    },
    email:{
        type:DataTypes.STRING,
        allowNull:false,
        isLowercase: true,
        unique:true
    },
    license_no:{
        type: DataTypes.STRING, 
        allowNull:false,
        unique:true
    },
    license_img:{
        type: DataTypes.STRING,
        allowNull:false
    },
    isAvailable:{
        type: DataTypes.BOOLEAN,
        allowNull:false,
        defaultValue:true
    },
    isDeleted:{
        type: DataTypes.BOOLEAN,
        defaultValue:false
    }
})

Driver.hasOne(pickupDriversBooking,{
    foreignKey:'driver_id',
    onDelete:"CASCADE",
    onUpdate:"CASCADE"
})

Driver.hasOne(dropoffDriversBooking,{
    foreignKey:'driver_id',
    onDelete:"CASCADE",
    onUpdate:"CASCADE"
})


Driver.sync({
    // alter:true
})
module.exports=Driver