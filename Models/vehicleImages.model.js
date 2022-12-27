const db = require('../config/db.js')
const { DataTypes } = require('sequelize')
const Vehicle = require('./Vehicle.js')


const VehicleImages = db.define('vehicleImages', {
    _id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    vehicle_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    image: {
        type: DataTypes.STRING,
        allowNull: false,
    }
})

// VehicleImages.hasMany(Vehicle, {
//     foreignKey: 'vehicle_id',
//     onDelete: "CASCADE",
//     onUpdate: "CASCADE"
// })
VehicleImages.sync({
    // alter:true
})
module.exports = VehicleImages;