const express=require('express')
const driver_router =require('./driver.routes')
const user_router=require('../Routes/user.routes')
const vehi_router=require('./vehicle.routes')
const vendor_router = require('./vendor.routes')
const pickup_router=require('./driverUpload.routes')


const admin_pickup_router=require('./Admin/adminPick.routes')
const admin_dropoff_router=require('./Admin/adminDrop.routes')


const bookingRoute=require('./booking.routes')
const customerRouter=require('./customer.routes')



const uplaod=require('../Utils/multer')
const { Router } = require('express')
const authRouter = require('./auth.Routes')
const shortUrlRoute = require('./shortUrl.routes')
const router = express.Router();

router.use('/driver',uplaod.single('license_img'),driver_router)
router.use('/user',user_router)
router.use('/vehicle',vehi_router)
router.use('/vendor',vendor_router)
router.use('/upload',uplaod.single('video'),pickup_router)
// router.use('/upload/dropoff',uplaod.single('video'),dropoff_router)



router.use('/admin/pickvideo',admin_pickup_router)
router.use('/admin/dropvideo',admin_dropoff_router)

router.use(bookingRoute)
router.use(customerRouter)
router.use(authRouter)
router.use(shortUrlRoute)


module.exports=router
