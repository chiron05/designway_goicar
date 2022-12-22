const { DataTypes }=require('sequelize')
const db=require('../config/db.js')

const pickupDriversBooking=db.define('pickupDriversBooking',{
   booking_id:{
    type: DataTypes.UUID
   },
   pickup_id:{
      type: DataTypes.UUID
   },
   driver_id:{
    type: DataTypes.UUID
   }
})
pickupDriversBooking.sync({
})
module.exports=pickupDriversBooking