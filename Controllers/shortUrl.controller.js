const httpStatusCodes = require("../Constants/http-status-codes");
const Customer = require("../Models/customer.model");
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
            const CustomerDetails=await Customer.findOne({
                attributes:['_id'],
                where:{
                    booking_id:result.bookingid
                }
            })
           
          if(CustomerDetails){
           
            res.render('pages/home',{
                customerid:result
            })
            return
          }
        }

        res.status(httpStatusCodes[403].code).json(formResponse(httpStatusCodes[403].code,'No data available'))


       
    } catch (error) {
        res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code,error))
    }
    
}
