const express = require('express')
const { getAddOnBookingByBookingID, createAddonBookingById,updateAddonBookingById } = require('../Controllers/addon_booking.controller')
const upload = require('../Utils/multer')

const addonbookingRoute = express.Router()


addonbookingRoute.get('/addonbooking/:id',getAddOnBookingByBookingID )
addonbookingRoute.post('/addonbooking/:id',createAddonBookingById )
addonbookingRoute.put('/addonbooking/:id',updateAddonBookingById )




module.exports = addonbookingRoute