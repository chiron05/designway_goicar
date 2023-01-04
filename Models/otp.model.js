const { DataTypes, Sequelize }=require('sequelize')
const db=require('../config/db.js')


const OTP=db.define('otp',{
   phone_number:{
    type:DataTypes.STRING,
    allowNull:false,
    unique:true
   },
   otp:{
    type:DataTypes.STRING,
    allowNull:false
   }
   ,createdAt: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
}
})




OTP.sync({
    // alter:true
})
module.exports=OTP