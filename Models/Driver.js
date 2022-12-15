const { DataTypes }=require('sequelize')
const db=require('../config/db.js')

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
        type: DataTypes.STRING(),
        allowNull:false,
        unique:true

    },
    alternate_number:{
        type: DataTypes.STRING(),
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
        type: DataTypes.STRING(), 
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

Driver.sync({
    // alter:true
})
module.exports=Driver