const express =require('express')
const  {
    getDrivers,
    createDriver,
    updateDriver,
    deleteDriver,
    getRideDetails
    
}=require('../Controllers/driver.controller.js')
const driver_router=express.Router()


driver_router.get('/',getDrivers)
driver_router.post('/',createDriver)
driver_router.put('/:id',updateDriver)
driver_router.delete('/:id',deleteDriver)
driver_router.get('/:id',getRideDetails)




module.exports=driver_router