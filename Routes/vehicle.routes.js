const express = require('express')
const {createVehicle,getAllVehicle,updateVehicle, deleteVehicle}=require('../Controllers/vehicle.controller')
const vehi_router=express.Router()

vehi_router.get('/',getAllVehicle)
vehi_router.post('/',createVehicle)
vehi_router.put('/:id',updateVehicle)
vehi_router.delete('/:id',deleteVehicle)



module.exports=vehi_router