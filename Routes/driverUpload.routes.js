const express=require('express')
const {
    DriverUpload
}=require('../Controllers/driverUpload.controller.js')

const pickup_router=express.Router()

pickup_router.put('/',DriverUpload)
// pickup_router.get('/:driver_id',getRideDetails)


module.exports=pickup_router