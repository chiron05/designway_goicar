const express=require('express')
const {
    getpickupvideo,VerifyVideo
}=require('../../Controllers/Admin/adminPickup.controller')


const admin_pickup_router=express.Router()

admin_pickup_router.get('/:booking_id',getpickupvideo)
admin_pickup_router.put('/:videoId',VerifyVideo)

module.exports=admin_pickup_router
