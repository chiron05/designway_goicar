const { DataTypes }=require('sequelize')
const db=require('../config/db.js');
const shortUrl = require('./shortUrl.model.js');

const Customer=db.define('customer',{

    _id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
    
    booking_id: {     //forgin key should come here
        type:DataTypes.UUID,
        // model: 'Vendor',
        // key: 'id'
    },
    firstName:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    lastName:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    email:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    phoneNumber:{
        type: DataTypes.STRING,
        allowNull: false,
       validate: {
        notNull: { args: true, msg: "You must enter Phone Number" },
        isInt: { args: true, msg: "You must enter Phone Number" }
    }},
   idProofURL:{
    type: DataTypes.STRING,
    allowNull: false
     },
     isDeleted:{
        type: DataTypes.BOOLEAN,
        defaultValue:false
    }
    
})



Customer.sync({
    // alter:true
})
module.exports=Customer













