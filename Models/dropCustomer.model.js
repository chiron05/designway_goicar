const { DataTypes }=require('sequelize')
const db=require('../config/db.js')

const DropCustomer=db.define('dropcustomer',{
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
        type: DataTypes.UUID
   
    },
    driver: {
        type: DataTypes.STRING,
        allowNull: false
    },
    contact_num: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: { args: true, msg: "You must enter Phone Number" },
            isInt: { args: true, msg: "You must enter Phone Number" }
        }
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
    }
    // TODO:- Fuel is pending

})

DropCustomer.sync()
module.exports=DropCustomer









