const { DataTypes } = require('sequelize')
const db = require('../config/db.js');
const Customer = require('./customer.model.js');

const shortUrl = db.define('shorturl', {

    _id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    bookingid: {
        type: DataTypes.UUID
    },
    shorturlid: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }

})



shortUrl.sync({
    // alter:true
})
module.exports = shortUrl













