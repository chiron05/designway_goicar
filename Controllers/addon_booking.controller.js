const httpStatusCodes = require("../Constants/http-status-codes")
const { createaddonbooking, updateaddonbooking } = require("../Joi/addon_booking.validation")
const addon_Booking = require("../Models/addon_booking.model")
const Booking = require("../Models/booking.model")
const { formResponse } = require("../Utils/helper")

exports.getAddOnBookingByBookingID=async(req,res)=>{
    const result= await addon_Booking.findOne({
        where:{
            booking_id:req.params.id,
            isDeleted:false
        }
    })
    console.log(result)
    console.log(req.params.id)
    if(result){
        return res.status(httpStatusCodes[200].code)
        .json(formResponse(httpStatusCodes[200].code,result))
    }else{
        return res.status(httpStatusCodes[500].code)
        .json(formResponse(httpStatusCodes[500].code,"Booking ID  is Invalid"))
    }
}

exports.updateAddonBookingById=async(req,res)=>{
    let validator={
        booking_id:req.params.id,
        ...req.body
    }
    const { error, value } = updateaddonbooking.validate(validator);
    if (error) {
        return res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code,{
            "message": error.details[0].message
        }))
    }

    const booking=await Booking.findOne({
        where:{
            _id:req.params.id,
            isDeleted:false
        }
    })

    if(!booking){
        return res.status(httpStatusCodes[400].code)
        .json(formResponse(httpStatusCodes[400].code,"Booking ID  is Invalid"))
    }


    try {
        addon_Booking.update(
            req.body
        ,{
            where:{
                booking_id:req.params.id,
                isDeleted:false
            }
        }).then(result=>{
            return res.status(httpStatusCodes[200].code)
            .json(formResponse(httpStatusCodes[200].code,{
                "message":"Updated Successfully",
                result
            }))
        }).catch(err=>{
            console.log(err)
            return res.status(httpStatusCodes[400].code)
            .json(formResponse(httpStatusCodes[400].code,err))
        })
    } catch (error) {
        return res.status(httpStatusCodes[500].code)
        .json(formResponse(httpStatusCodes[500].code,error))
    }
}

exports.createAddonBookingById=async(req,res)=>{
    const { error, value } = createaddonbooking.validate({
        booking_id:req.params.id,
        Insurance:req.body.Insurance,
        zero_liability:req.body.zero_liability,
        pick_charges:req.body.pick_charges,
        drop_charges:req.body.drop_charges,
        owh_pickup:req.body.owh_pickup,
        owh_dropoff:req.body.owh_dropoff,
        fuel:req.body.fuel,
        tank:req.body.tank,
        os_rental:req.body.os_rental,
        os_tax:req.body.os_tax,
        discount:req.body.discount,
        comments:req.body.comments
    });
    if (error) {
        return res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code,{
            "message": error.details[0].message
        }))
    }
    
    const booking=await Booking.findOne({
        where:{
            _id:req.params.id,
            isDeleted:false
        }
    })

    if(!booking){
        return res.status(httpStatusCodes[400].code)
        .json(formResponse(httpStatusCodes[400].code,"Booking ID  is Invalid"))
    }
    try {
        addon_Booking.create({
            booking_id:req.params.id,
            Insurance:req.body.Insurance,
            zero_liability:req.body.zero_liability,
            pick_charges:req.body.pick_charges,
            drop_charges:req.body.drop_charges,
            owh_pickup:req.body.owh_pickup,
            owh_dropoff:req.body.owh_dropoff,
            fuel:req.body.fuel,
            tank:req.body.tank,
            os_rental:req.body.os_rental,
            os_tax:req.body.os_tax,
            discount:req.body.discount,
            comments:req.body.comments
        }).then(result=>{
            return res.status(httpStatusCodes[200].code)
            .json(formResponse(httpStatusCodes[200].code,{
                "message":"Created Successfully",
                result
            }))
        }).catch(err=>{
            console.log(err)
            return res.status(httpStatusCodes[400].code)
            .json(formResponse(httpStatusCodes[400].code,err))
        })
    } catch (error) {
        return res.status(httpStatusCodes[500].code)
        .json(formResponse(httpStatusCodes[500].code,error))
    }

}

exports.deleteAddonBookingById=async(req,res)=>{
    const result= await Promise.all([Booking.findOne({
        where:{
            _id:req.params.id,
            isDeleted:false
        }
    }),addon_Booking.findOne({
        where:{
            booking_id:req.params.id,
            isDeleted:false
        }
    })])

    const booking=result[0]
    const addonbooking=result[1]

    if(!booking){
        return res.status(httpStatusCodes[400].code)
        .json(formResponse(httpStatusCodes[400].code,"Booking ID is Invalid"))
    }

    if(!addonbooking){
        return res.status(httpStatusCodes[400].code)
        .json(formResponse(httpStatusCodes[400].code,"no addOn Booking available for this Booking ID"))
    }

    const deleteAddOn=await addon_Booking.update({
        isDeleted:true
    },{
        where:{
            booking_id:req.params.id,
            isDeleted:false
        }
    })

    if(deleteAddOn[0]){
        return res.status(httpStatusCodes[200].code)
        .json(formResponse(httpStatusCodes[200].code,"Deleted Successfully"))
    }else{
        return res.status(httpStatusCodes[500].code)
        .json(formResponse(httpStatusCodes[500].code))
    }
   
}