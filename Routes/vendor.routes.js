const express = require('express')

const {
    getVendors,
    createVendor,
    updateVendor,
    deleteVendors,
    getVendorById,
    getVendorByPhone,
    getVendorByName
} = require('../Controllers/vendor.controller.js')

const vendor_router = express.Router()

vendor_router.get('/', getVendors)
vendor_router.get('/:id', getVendorById)
vendor_router.post('/', createVendor)
vendor_router.put('/:id', updateVendor)
vendor_router.delete('/:id', deleteVendors)
vendor_router.get('/phonenumber/:no', getVendorByPhone)
vendor_router.get('/vendorname/name', getVendorByName)


module.exports = vendor_router