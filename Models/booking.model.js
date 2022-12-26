const { DataTypes } = require('sequelize')
const db = require('../config/db.js')
const Customer = require('./customer.model.js')
const DropCustomer = require('./dropCustomer.model.js')
const dropoffDriversBooking = require('./dropoffDriversBooking.model.js')
const PickCustomer = require('./pickCustomer.model.js')
const pickupDriversBooking = require('./pickupDriversBooking.model.js')
const shortUrl = require('./shortUrl.model.js')



const Booking = db.define('booking', {
    _id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    customer_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    vehicle_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    pickup_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    pickup_time: {
        type: DataTypes.TIME,
        allowNull: false,
        required: true
    },
    dropoff_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    dropoff_time: {
        type: DataTypes.TIME,
        allowNull: false,
        required: true
    },
    vehicle_type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    pickup_location: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    dropoff_location: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    duration: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    booking_status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "pending"
    },
    isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }

})



Booking.hasOne(shortUrl, {
    foreignKey: 'bookingid',
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});


Booking.hasOne(Customer, {
    foreignKey: 'booking_id',
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

Booking.hasOne(DropCustomer, {
    foreignKey: 'booking_id',
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

Booking.hasOne(PickCustomer, {
    foreignKey: 'booking_id',
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

Booking.hasMany(pickupDriversBooking, {
    foreignKey: 'booking_id',
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

Booking.hasMany(dropoffDriversBooking, {
    foreignKey: 'booking_id',
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});


Customer.belongsTo(Booking, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
})


Booking.sync({
    // alter:true
})
module.exports = Booking

