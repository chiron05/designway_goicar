const { DataTypes }=require('sequelize')
const db=require('../config/db.js')

const Payment=db.define('Payment',{
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
   total_rent:{
    type:DataTypes.INTEGER,
    allowNull: false
   },
   pickup_fee:{
    type:DataTypes.INTEGER,
    allowNull: false
   },
   dropoff_fee:{
    type:DataTypes.INTEGER,
    allowNull: false
   },
   fuel:{
    type:DataTypes.INTEGER,
    allowNull: false
   },
   insurance:{
    type:DataTypes.INTEGER,
    allowNull: false
   },
   zero_liability:{
    type:DataTypes.INTEGER,
    allowNull: false
   },
   tax:{
    type:DataTypes.INTEGER,
   },
   gst:{
    type:DataTypes.INTEGER,
   },
   deposit:{
    type:DataTypes.INTEGER,
    allowNull: false
   },
   total:{
    type:DataTypes.STRING,
    allowNull: false
   },
   status:{
    type:DataTypes.STRING,
    defaultValue:"pending"
   },
   mihpayid:{
    type:DataTypes.STRING
   },
   mode:{
    type:DataTypes.STRING
   },
   txnid:{
    type:DataTypes.STRING
   },
   discount:{
    type:DataTypes.STRING
   },
   net_amount_debit:{
    type:DataTypes.STRING
   },
   addedon:{
    type:DataTypes.STRING
   },
   payment_source:{
    type:DataTypes.STRING
   },
   bank_ref_num:{
    type:DataTypes.STRING
   },
   bankcode:{
    type:DataTypes.STRING
   },
   isDeleted:{
    type: DataTypes.BOOLEAN,
    defaultValue:false
}

})

Payment.sync({
    // alter:true
})
module.exports=Payment









