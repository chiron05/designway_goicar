const { DataTypes } = require('sequelize')
const db = require('../config/db.js')


const User = db.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,

    },
    token: {
        type: DataTypes.STRING
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false
    },

    full_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone_number: {
        type: DataTypes.STRING(),
        allowNull: false,
        unique: true,
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        isLowercase: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,

    },
    // password
    id_proof: {
        type: DataTypes.STRING,
        allowNull: false,

    },
    isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }

})

User.sync({
    // alter:true
})
module.exports = User