const express = require('express')
const { getAddOnBookingByBookingID, createAddonBookingById,updateAddonBookingById,deleteAddonBookingById } = require('../Controllers/addon_booking.controller')
const upload = require('../Utils/multer')

const addonbookingRoute = express.Router()


addonbookingRoute.get('/addonbooking/:id',getAddOnBookingByBookingID )
addonbookingRoute.post('/addonbooking/:id',createAddonBookingById )
addonbookingRoute.put('/addonbooking/:id',updateAddonBookingById )
addonbookingRoute.delete('/addonbooking/:id',deleteAddonBookingById )




module.exports = addonbookingRoute