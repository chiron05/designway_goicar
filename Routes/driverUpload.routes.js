const express=require('express')
const {
    DriverUpload
}=require('../Controllers/driverUpload.controller.js')

const pickup_router=express.Router()

pickup_router.put('/',DriverUpload)


module.exports=pickup_router