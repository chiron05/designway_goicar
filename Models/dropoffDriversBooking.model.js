const { DataTypes }=require('sequelize')
const db=require('../config/db.js')

const dropoffDriversBooking=db.define('dropoffDriversBooking',{
   booking_id:{
    type: DataTypes.UUID
   },
   dropoff_id:{
      type: DataTypes.UUID
   },
   driver_id:{
    type: DataTypes.UUID
   }
})
dropoffDriversBooking.sync({
})
module.exports=dropoffDriversBooking