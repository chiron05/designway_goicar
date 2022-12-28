const httpStatusCodes = require("../Constants/http-status-codes")
const { genrateInvoiceSchema } = require("../Joi/payment.validation")
const Booking = require("../Models/booking.model")
const Payment = require("../Models/payment.model")
const { formResponse } = require("../Utils/helper")

exports.genrateInvoice=async(req,res)=>{

   
    
    let total=req.body.total_rent*5000+req.body.pickup_fee+req.body.dropoff_fee+req.body.fuel+req.body.insurance+req.body.zero_liability+req.body.tax+req.body.gst+req.body.deposit

    const bookingDetails=await Booking.findOne({
        where:{
            _id:req.params.id,
            isDeleted:false
        }
    })

    if(!bookingDetails){
        return res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code,"Booking ID is Invalid"))  
    }

    const {error,value}=genrateInvoiceSchema.validate({
        booking_id:req.params.id,
        total_rent:req.body.total_rent*5000,
        pickup_fee:req.body.pickup_fee,
        dropoff_fee:req.body.dropoff_fee,
        fuel:req.body.fuel,
        insurance:req.body.insurance,
        zero_liability:req.body.zero_liability,
        tax:req.body.tax,
        gst:req.body.gst,
        deposit:req.body.deposit,
        total:total.toString()
    });
    if(error){
       return res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code,error))     
   
    }
    try {
        const payment =await Payment.create({
            booking_id:req.params.id,
            total_rent:req.body.total_rent*6,
            pickup_fee:req.body.pickup_fee,
            dropoff_fee:req.body.dropoff_fee,
            fuel:req.body.fuel,
            insurance:req.body.insurance,
            zero_liability:req.body.zero_liability,
            tax:req.body.tax,
            gst:req.body.gst,
            deposit:req.body.deposit,
            total:total.toString()
        })
       return  res.status(httpStatusCodes[200].code)
       .json(formResponse(httpStatusCodes[200].code, payment))
    } catch (error) {
        return  res.status(httpStatusCodes[404].code)
        .json(formResponse(httpStatusCodes[404].code, error))
    }
  
}
