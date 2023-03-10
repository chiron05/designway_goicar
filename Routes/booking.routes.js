const express = require('express')
const upload = require('../Utils/multer')

const { pickup, dropoff, createVehicleBooking, confirmBooking, updateVehicleBooking, updatepickup, updatedropoff, bookingCancellation, getBooking, getAllBooking } = require('../Controllers/booking.controller')
const bookingRoute = express.Router()


bookingRoute.post('/vehicle-booking', createVehicleBooking)
bookingRoute.get('/vehicle-booking', getAllBooking)
bookingRoute.put('/vehicle-booking/:id', updateVehicleBooking)
bookingRoute.get('/vehicle-booking/:id', getBooking)
bookingRoute.post('/vehicle-booking/pickup', pickup)
bookingRoute.put('/vehicle-booking/pickup/:id', updatepickup)
bookingRoute.post('/vehicle-booking/dropoff', dropoff)
bookingRoute.put('/vehicle-booking/dropoff/:id', updatedropoff)
bookingRoute.post('/confirmBooking', confirmBooking)
bookingRoute.get('/vehicle-booking/cancellation/:id', bookingCancellation)




module.exports = bookingRoute