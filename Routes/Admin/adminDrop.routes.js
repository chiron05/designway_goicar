const express=require('express')
const {
    getdropvideo,VerifyVideo
}=require('../../Controllers/Admin/adminDropoff.controllers')


const admin_dropoff_router=express.Router()

admin_dropoff_router.get('/:booking_id',getdropvideo)
admin_dropoff_router.put('/:video_id',VerifyVideo)

module.exports=admin_dropoff_router