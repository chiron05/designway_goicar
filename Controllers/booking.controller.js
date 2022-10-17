const path=require('path')
const Booking=require('../Models/booking.model')
const PickCustomer=require('../Models/pickCustomer.model')
const DropCustomer=require('../Models/dropCustomer.model')
const Customer=require('../Models/customer.model')
const cloudinary=require('../Utils/cloudinary')
const Driver = require('../Models/Driver')
const { emailNotify } = require('../services/email')
const { whatsappNotify } = require('../services/whatsapp')
const { formResponse } = require('../Utils/helper')
const httpStatusCodes = require('../Constants/http-status-codes')
const shortUrl = require('../Models/shortUrl.model')
const { any } = require('../Utils/multer')

exports.confirmBooking=async(req,res)=>{
   
    let uniqueID = Math.random().toString(36).replace(/[^a-z0-9]/gi,'').substring(2,10);
    console.log(req.query.bookingId)
    try {
        let data=shortUrl.build({
            bookingid:req.query.bookingId,
            shorturlid:uniqueID
        })
        await data.save();
        res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[400].code,{
            "Url":`http://localhost:3000/shorturl/${uniqueID}`
        }))

        
    } catch (error) {
    res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code,error))
    }
    
}

exports.updateVehicleBooking=async(req,res)=>{
    try {
        Booking.update(
             req.body ,
            { where: { _id: req.params.id } }
          )
            .then(result =>{
                if(result[0]){
                    res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code,`Booking Updated Successfully`))
                }
                else{
                    res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code,`No Bookings are available for BookingID: ${ req.params.id}`))
                }  
            }
            )
            .catch(err =>
                res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code,err))
            )
    } catch (error) {
        res.status(httpStatusCodes[500].code).json(formResponse(httpStatusCodes[500].code,error))
    }
}


exports.createVehicleBooking=async(req,res)=>{
   try {
        
        let data= Booking.build({
            vehicle_id:req.body.vehicle_id,
            pickup_date:req.body.pickup_date,
            pickup_time:req.body.pickup_time,
            dropoff_date:req.body.dropoff_date,
            dropoff_time:req.body.dropoff_time,
            vehicle_type:req.body.vehicle_type,
            pickup_location:req.body.pickup_location,
            dropoff_location:req.body.dropoff_location,
            duration:req.body.duration
        })
        await data.save();

        if(data.errors){
            res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code,data.error))
        }
        else{
            let customer=await Customer.update({booking_id:data._id},{
                where:{
                    _id:req.body.customer_id
                }
            })
           
            if(!customer[0]){
                res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code,"Unable to create Booking for customer"))
                return
            }
            res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code,data))
        }
   } catch (error) {
    console.log(error)
    res.status(httpStatusCodes[500].code).json(formResponse(httpStatusCodes[500].code,error))
   }
}

exports.updatepickup=async(req,res)=>{
    try {
        PickCustomer.update(
             req.body ,
            { where: { booking_id: req.params.id } }
          )
            .then(result =>{
                if(result[0]){
                    res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code,`PickUp for booking:${req.params.id} updated successfully ${result}`))
                }
                else{
                    res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code,`No Bookings are available for BookingID: ${ req.params.id}`))
                }       
            }
            )
            .catch(err =>
                res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code,err))
            )
    } catch (error) {
        res.status(httpStatusCodes[500].code).json(formResponse(httpStatusCodes[500].code,error))
    }
}

exports.pickup=async(req,res)=>{
    try{
       
            const DriverDetails= await Driver.findOne({
                where:{
                    id:req.body.driverId
                }
            })
         
            const customerDetails=await Customer.findOne({
                attributes:["email","phoneNumber"],
                where:{
                    booking_id:req.body.booking_id
                }
            })
            console.log(customerDetails)
            if(!DriverDetails|| !customerDetails){
                res.status(httpStatusCodes[404].code)
                .json(formResponse(httpStatusCodes[404].code, "No records Found"))
            return;
            }
            
        const pickUp= await PickCustomer.create(
            {   
                booking_id:req.body.booking_id,
                vehicle_id:req.body.vehicle_id,
                driver:req.body.driverId,
                contact_num:req.body.contact_num,    
                vehicle_condition:req.body.vehicle_condition
            }
            )
            
        const CustomerEmailError=await emailNotify(customerDetails.email,'subject','having this ride');
        const CustomerWhatAppError= await whatsappNotify('having this ride',customerDetails.phoneNumber);
        const DriverEmailError=await emailNotify(DriverDetails.email,'subject','having this ride');
        const DriverWhatAppError= await whatsappNotify('having this ride',DriverDetails.phone_number);
        if(CustomerEmailError || CustomerWhatAppError||DriverEmailError||DriverWhatAppError){
            res.status(httpStatusCodes[404].code)
            .json(formResponse(httpStatusCodes[404].code, {
                "DriverEmailError":DriverEmailError,
                "DriverWhatsAppError":DriverWhatAppError,
                "CustomerEmailError":CustomerEmailError,
                "CustomerWhatAppError":CustomerWhatAppError
            }))
            return;
        }
        else{
            res.status(httpStatusCodes[200].code)
            .json(formResponse(httpStatusCodes[404].code, "Driver informed successfully"))
            return;
        }
    }
    catch(error)
    {
        res.status(httpStatusCodes[500].code).json(formResponse(httpStatusCodes[500].code,error))
        
    }
   
}

exports.updatedropoff=async(req,res)=>{
    try {
        DropCustomer.update(
             req.body ,
            { where: { booking_id: req.params.id } }
          )
            .then(result =>{
                if(result[0]){
                    res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code,`DropOff for booking:${req.params.id} updated successfully ${result}`))
                }
                else{
                    res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code,`No Bookings are available for BookingID: ${ req.params.id}`))
                }       
            }
            )
            .catch(err =>
                res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code,err))
            )
    } catch (error) {
        res.status(httpStatusCodes[500].code).json(formResponse(httpStatusCodes[500].code,error))
    }
}

exports.dropoff=async(req,res,next)=>{
    try{
        const DriverDetails= await Driver.findOne({
            where:{
                id:req.body.driverId
            }
        })
     
        const customerDetails=await Customer.findOne({
            attributes:["email","phoneNumber"],
            where:{
                booking_id:req.body.booking_id
            }
        })
      
        if(!DriverDetails|| !customerDetails){
            res.status(httpStatusCodes[404].code)
            .json(formResponse(httpStatusCodes[404].code, "No records Found"))
        return;
        }
        
    const dropoff= await DropCustomer.create(
        {   
            booking_id:req.body.booking_id,
            vehicle_id:req.body.vehicle_id,
            driver:req.body.driverId,
            contact_num:req.body.contact_num,    
            vehicle_condition:req.body.vehicle_condition
        }
        )
        
    const CustomerEmailError=await emailNotify(customerDetails.email,'subject','yo having this ride');
    const CustomerWhatAppError= await whatsappNotify('kyaa bhaiii',customerDetails.phoneNumber);
    const DriverEmailError=await emailNotify(DriverDetails.email,'subject','yo having this ride');
    const DriverWhatAppError= await whatsappNotify('kyaa bhaiii',DriverDetails.phone_number);
    if(CustomerEmailError || CustomerWhatAppError||DriverEmailError||DriverWhatAppError){
        res.status(httpStatusCodes[404].code)
        .json(formResponse(httpStatusCodes[404].code, {
            "DriverEmailError":DriverEmailError,
            "DriverWhatsAppError":DriverWhatAppError,
            "CustomerEmailError":CustomerEmailError,
            "CustomerWhatAppError":CustomerWhatAppError
        }))
        return;
    }
    else{
        res.status(httpStatusCodes[200].code)
        .json(formResponse(httpStatusCodes[404].code, "Driver informed successfully"))
        return;
    }
}
catch(error)
{
    res.status(httpStatusCodes[500].code).json(formResponse(httpStatusCodes[500].code,error))    
}
}



