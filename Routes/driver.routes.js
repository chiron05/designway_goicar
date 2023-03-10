const express =require('express')
const tokenAuthentication = require('../Auth/tokenVerification.js')
const  {
    getDrivers,
    createDriver,
    updateDriver,
    deleteDriver,
    getRideDetails,
    additonalPickUpDriver,
    additonalDrpOffDriver,
    getDriverById,
    getDriverByName,
    getDriverByPhone,
    getDriverHistory,
    removeAdditionalPickupDriver,
    removeAdditionalDropOffDriver,
    getUpcomingRideDetails,
    getcompletedRideDetails
    
}=require('../Controllers/driver.controller.js')
const driver_router=express.Router()



driver_router.get('/',getDrivers)
driver_router.get('/ride/:id',getRideDetails)
driver_router.get('/ride/upcoming/:id',getUpcomingRideDetails)
driver_router.get('/ride/completed/:id',getcompletedRideDetails)
driver_router.get('/:id',getDriverById)
driver_router.get('/history/:id',getDriverHistory)
driver_router.get('/phonenumber/:no', getDriverByPhone)
driver_router.get('/drivername/name', getDriverByName)
driver_router.post('/',createDriver)
driver_router.post('/additional-pickup-driver',additonalPickUpDriver)
driver_router.post('/additional-dropoff-driver',additonalDrpOffDriver)
driver_router.put('/:id',updateDriver)
driver_router.delete('/:id',deleteDriver)
driver_router.delete('/remove/additional-pickup-driver',removeAdditionalPickupDriver)
driver_router.delete('/remove/additional-dropoff-driver',removeAdditionalDropOffDriver)



module.exports=driver_router