const { DataTypes } = require('sequelize')
const db= require('../config/db.js')
const Vendor=require('./Vendor.js')
const Vehicle=db.define('vehicle',{
    
    id:{
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },

    number:{
        type: DataTypes.INTEGER,
        allowNull:false
    },
    make:{
        type: DataTypes.STRING,
        allowNull:false
    },
    type: {
        type: DataTypes.STRING,
        allowNull:false
    },
    transmission:{
        type:DataTypes.STRING,
        allowNull:false

    },
    class:{
        type:DataTypes.STRING,
        allowNull:false
    },
    registration_no: {
        type:DataTypes.STRING,
        allowNull:false
    },
    colour: {
        type:DataTypes.STRING,
        allowNull:false
    },
    image: {
        type:DataTypes.STRING,
        allowNull:false
    },
    owner: {     //forgin key should come here
        type:DataTypes.UUID,
        // model: 'Vendor',
        // key: 'id'
    },
    on_goicar_since: {
        type:DataTypes.DATE,
        allowNull:false
        
    },
    rc_Book: {
        type:DataTypes.STRING,
        allowNull:false
    },
    pollution_certificate: {
        type:DataTypes.STRING,
        allowNull:false
    },
    insurance: {
        type:DataTypes.STRING,
        allowNull:false
    },
    RSA:{
        type:DataTypes.STRING,
        allowNull:false
},
isDeleted:{
    type: DataTypes.BOOLEAN,
    defaultValue:false
}

})

Vendor.hasMany(Vehicle,{
    foreignKey:'owner',
    
})
Vehicle.belongsTo(Vendor,{
    foreignKey:'owner', 
})

Vehicle.sync({
    // alter:true
})
module.exports=Vehicle