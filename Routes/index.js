const express = require('express')
const driver_router = require('./driver.routes')
const vehi_router = require('./vehicle.routes')
const vendor_router = require('./vendor.routes')
const pickup_router = require('./driverUpload.routes')
const admin_pickup_router = require('./Admin/adminPick.routes')
const admin_dropoff_router = require('./Admin/adminDrop.routes')
const bookingRoute = require('./booking.routes')
const customerRouter = require('./customer.routes')
const upload = require('../Utils/multer')
const { Router } = require('express')
const authRouter = require('./auth.Routes')
const shortUrlRoute = require('./shortUrl.routes')
const paymentRouter = require('./payment.routes')
const pay_router = require('./payu.routes')
const user_routes = require('./user.routes')
const addonbookingRoute = require('./addon_booking.routes')
const router = express.Router();

router.use('/driver',upload.single('license_img') ,driver_router)
router.use('/vehicle', upload.fields([
    {
        name: 'image', maxCount: 4
    },
    {
        name: 'rc_Book', maxCount: 1
    },
    {
        name: 'pollution_certificate', maxCount: 1
    },
    {
        name: 'insurance', maxCount: 1
    },
    {
        name: 'RSA', maxCount: 1
    }

]),vehi_router)
router.use('/vendor', upload.single('id_proof'), vendor_router)
router.use('/upload', upload.single('video'), pickup_router)
router.use('/admin/pickvideo', admin_pickup_router)
router.use('/admin/dropvideo', admin_dropoff_router)


router.use(bookingRoute)
router.use(customerRouter)
router.use(authRouter)
router.use(shortUrlRoute)
router.use(addonbookingRoute)
router.use(pay_router)
router.use(paymentRouter)
router.use(user_routes)


module.exports = router
