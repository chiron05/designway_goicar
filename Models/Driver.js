const { DataTypes }=require('sequelize')
const db=require('../config/db.js')

const Driver=db.define('driver',{

    id:{
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    full_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone_number:{
        type: DataTypes.STRING(1234),
        allowNull:false

    },
    alternate_number:{
        type: DataTypes.STRING(1234),
        allowNull:false
    },
    email:{
        type:DataTypes.STRING,
        allowNull:false,
        isLowercase: true
    },
    license_no:{
        type: DataTypes.STRING(1234), 
        allowNull:false
    },
    license_img:{
        type: DataTypes.STRING,
        allowNull:false
    },
    isAvailable:{
        type: DataTypes.BOOLEAN,
        allowNull:false,
        defaultValue:true
    }
})

Driver.sync()
module.exports=Driver