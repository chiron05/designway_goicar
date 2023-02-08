const express = require('express')
const { createVehicle, getAllVehicle, updateVehicle, deleteVehicle, getVehicleById , getVehicleImages} = require('../Controllers/vehicle.controller')
const vehi_router = express.Router()

vehi_router.get('/', getAllVehicle)
vehi_router.post('/', createVehicle)
vehi_router.get('/:id', getVehicleById);
vehi_router.put('/:id', updateVehicle)
vehi_router.delete('/:id', deleteVehicle)
vehi_router.get('/images/:id',getVehicleImages)


module.exports = vehi_router