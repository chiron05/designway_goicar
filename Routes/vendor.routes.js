const express = require('express')

const {
    getVendors,
    createVendor,
    updateVendor,
    deleteVendors
} = require('../Controllers/vendor.controller.js')

const vendor_router = express.Router()

vendor_router.get('/', getVendors)
vendor_router.post('/', createVendor)
vendor_router.put('/:id', updateVendor)
vendor_router.delete('/:id', deleteVendors)

module.exports = vendor_router