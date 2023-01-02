const PickCustomer=require('../Models/pickCustomer.model.js')
const DropCustomer=require('../Models/dropCustomer.model')
const cloudinary=require('../Utils/cloudinary')
const { driverUpload } = require('../Joi/driver.validation.js')
const httpStatusCodes = require('../Constants/http-status-codes.js')
const { formResponse } = require('../Utils/helper.js')
///if i want to put the switch case i have to import  both the models here


exports.DriverUpload=async(req,res,next)=>{
    if(Object.keys(req.body).length === 0){
        return  res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code,"Body is empty"))    
    }

    if(!req.file){
        res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code,"video path not found"))     
        return 
    }

    const {error,value}=driverUpload.validate({
        booking_id:req.body.booking_id,
        pickup:req.body.pickup
    });
    if(error){
        res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code,error))     
        return 
    }  
   var pickup=req.body.pickup
   if(pickup == 'true')
   {
    try{
        const result= await cloudinary.uploader.upload(req.file.path,{
            resource_type: "auto"
        })

        await PickCustomer.update({video: result.secure_url,
        video_id:result.public_id},{
        where:{
            booking_id:req.body.booking_id,
            isDeleted:false
        }
    })
        
        res.status(200).send("pickup video uploaded successful")
      
    }
    catch(err)
    {
        console.log(err)
        res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code,err))     
    }
   }
   else 
   {
    if(!req.file){
        res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code,"video path not found"))     
        return 
    }

    try {
        const result = await cloudinary.uploader.upload(req.file.path, {
            resource_type: "auto"
        })

        await DropCustomer.update({
            video: result.secure_url,
            video_id: result.public_id
        }, {
            where: {
                booking_id: req.body.booking_id,
                isDeleted:false
            }
        })

        res.status(200).send("Dropoff video uploaded successful")

    }
    catch (err) {
        res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code,err))     
    }
   }
}

