const httpStatusCodes = require("../Constants/http-status-codes");
const Booking = require("../Models/booking.model");
const Customer = require("../Models/customer.model");
const Payment = require("../Models/payment.model");
const shortUrl = require("../Models/shortUrl.model");
const { formResponse } = require("../Utils/helper");

exports.userDetails=async(req,res)=>{

    try {
        const result= await shortUrl.findOne({
            where:{
                shorturlid:req.params.uniqueid
            }
        })
        if(result){
            let userDetails={}
            const CustomerDetails=await Customer.findOne({
                attributes:['_id','firstName','lastName','email','phoneNumber'],
                where:{
                    booking_id:result.bookingid
                }
            })
           
            const BookingDetails=await Booking.findOne({
                where:{
                    _id:result.bookingid
                }
            })

            const PaymentDetails=await Payment.findOne({
                where:{
                    booking_id:result.bookingid
                }
            })


          if(CustomerDetails && BookingDetails && PaymentDetails){
            userDetails={
                ...CustomerDetails.dataValues,
                ...BookingDetails.dataValues,
                ...PaymentDetails.dataValues
            }
            console.log(userDetails)
            res.render('pages/home',{
                userDetails
            })
            return
          }
        }

        res.status(httpStatusCodes[404].code).json(formResponse(httpStatusCodes[404].code))


       
    } catch (error) {
        console.log(error)
        res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code,error))
    }
    
}
