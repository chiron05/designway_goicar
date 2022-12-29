const httpStatusCodes = require('../Constants/http-status-codes');
const { formResponse } = require('../Utils/helper');
const PickCustomer=require('../Models/pickCustomer.model')
const DropCustomer = require('../Models/dropCustomer.model')
const Driver = require('../Models/Driver.js')
const { Op, Sequelize } = require('sequelize')
const cloudinary = require('../Utils/cloudinary');
const { createDriverSchema, updateDriverSchema, getRideDetailsSchema, deleteDriverSchema, getDriverById } = require('../Joi/driver.validation');
const pickupDriversBooking = require('../Models/pickupDriversBooking.model');
const dropoffDriversBooking = require('../Models/dropoffDriversBooking.model');
const User = require('../Models/User');


exports.getDrivers = async (req, res) => {
    await Driver.findAll({
        where:{
            isDeleted:false
        }
    }).then(result => {
        res.status(httpStatusCodes[200].code)
            .json(formResponse(httpStatusCodes[200].code, result))
    }).catch(err => {
        res.status(httpStatusCodes[404].code)
            .json(formResponse(httpStatusCodes[404].code, err))
    })
}

exports.additonalPickUpDriver=async(req,res)=>{
    const pickUpdetails=await PickCustomer.findOne({
       where:{
        _id:req.body.pickup_id
       }
    })

    const driverDetails=await Driver.findOne({
       where:{
        id:req.body.driver_id,
        isDeleted:false,
        isAvailable:false
       }
    })

    if(driverDetails){
        return  res.status(httpStatusCodes[404].code)
        .json(formResponse(httpStatusCodes[404].code, "Driver Unavailable"))
    }
    if(pickUpdetails){
        const additonalDriver=await pickupDriversBooking.create({
            booking_id:pickUpdetails.booking_id,
            pickup_id:req.body.pickup_id,
            driver_id:req.body.driver_id
        })
        const updateDriver=await Driver.update({
            isAvailable:false
         },{
            where:{
                id:req.body.driver_id,
                isDeleted:false
            }
         })
         
        return  res.status(httpStatusCodes[200].code)
        .json(formResponse(httpStatusCodes[200].code, "Additional Driver added successfully"))
    }
    else{
       return res.status(httpStatusCodes[404].code)
        .json(formResponse(httpStatusCodes[404].code, "Invalid PickUp ID"))
    }
}

exports.additonalDrpOffDriver=async(req,res)=>{
    const dropOffdetails=await DropCustomer.findOne({
        where:{
         _id:req.body.dropOff_id
        }
     })
 
     const driverDetails=await Driver.findOne({
        where:{
         id:req.body.driver_id,
         isDeleted:false,
         isAvailable:false
        }
     })
 
     if(driverDetails){
         return  res.status(httpStatusCodes[404].code)
         .json(formResponse(httpStatusCodes[404].code, "Driver Unavailable"))
     }
     if(dropOffdetails){
         const additonalDriver=await dropoffDriversBooking.create({
             booking_id:dropOffdetails.booking_id,
             dropoff_id:req.body.dropOff_id,
             driver_id:req.body.driver_id
         })
         const updateDriver=await Driver.update({
            isAvailable:false
         },{
            where:{
                id:req.body.driver_id,
                isDeleted:false
            }
         })
         return  res.status(httpStatusCodes[200].code)
         .json(formResponse(httpStatusCodes[200].code, "Additional Driver added successfully"))
     }
     else{
        return res.status(httpStatusCodes[404].code)
         .json(formResponse(httpStatusCodes[404].code, "Invalid Drop Off ID"))
     }
}

exports.createDriver = async (req, res) => {

    if(Object.keys(req.body).length === 0){
        return  res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code,"Body is empty"))    
    }

    const userEmail=User.findOne({
        where:{
            email:req.body.email,
            isDeleted:false
        }
    })

    const userPhoneNumber=User.findOne({
        where:{
            phone_number:req.body.phone_number,
            isDeleted:false
        }
    })

    const result=await Promise.all([userEmail,userPhoneNumber])
    if(result[0]){
        return res.status(httpStatusCodes[404].code)
        .json(formResponse(httpStatusCodes[404].code, "Email ID Already in Used"))
    }

    if(result[0]){
        return res.status(httpStatusCodes[404].code)
        .json(formResponse(httpStatusCodes[404].code, "Phone number Already in Used"))
    }


    if(req.body.phone_number==req.body.alternate_number){
        res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, `Alternate phonenumber must be different`))
        return;
    }
    try {
        const result = await cloudinary.uploader.upload(req.file.path, {
            resource_type: "auto"
        })


        const {error,value}=createDriverSchema.validate({
            full_name: req.body.full_name,
            phone_number: req.body.phone_number,
            alternate_number: req.body.alternate_number,
            email: req.body.email,
            license_no: req.body.license_no,
            license_img: result.url,
            password:req.body.password
        });
        if(error){
            res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code,error))     
            return 
        }  

        
        const existDriver=await Driver.findOne({ 
            where:Sequelize.and(
                {
                    isDeleted:true
                },Sequelize.or(                   
                        {email:req.body.email},
                        {phone_number:req.body.phone_number}
                )                          
        )
        })
    
       
       if(existDriver){
            const updateExistingDriver=await Driver.update({
                isDeleted:false
            },{
                where:Sequelize.and(
                    {
                        isDeleted:true
                    },Sequelize.or(                   
                            {email:req.body.email},
                            {phone_number:req.body.phone_number}
                    )
                )
            })

            return  res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code,{
                "message":"Driver's Account Reactivated"
            }))    
       }


        const existingDriver=await Driver.findOne({
            where:{
                email:req.body.email,
                isDeleted:true
            }
        })
       if(existingDriver){
            const driverDelete=await Driver.destroy({
                where: {
                    email:req.body.email
                }
            })
       }


        const driver = Driver.build({
            full_name: req.body.full_name,
            phone_number: req.body.phone_number,
            alternate_number: req.body.alternate_number,
            email: req.body.email,
            license_no: req.body.license_no,
            license_img: result.url
        })


        await driver.save()

       
        if (driver.errors) {
            return res.status(httpStatusCodes[404].code)
                .json(formResponse(httpStatusCodes[404].code, driver.errors))
        }
        else {

            const userCreation=await User.create({
                id:driver.id,
                role:"driver",
                full_name:driver.full_name,
                phone_number:driver.phone_number,
                email:driver.email,
                password:req.body.password,
                id_proof:driver.license_img         
            })
    
           return res.status(httpStatusCodes[200].code)
                .json(formResponse(httpStatusCodes[200].code, {
                    "message":"driver created successfully",
                    driver
                }))
        }

    }
    catch (err) {
        console.log(err)
        return res.status(httpStatusCodes[500].code)
            .json(formResponse(httpStatusCodes[500].code, err))
    }
    }



exports.updateDriver = async (req, res) => {
    if(Object.keys(req.body).length === 0){
        return  res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code,"Body is empty"))    
    }

    const {error,value}=updateDriverSchema.validate(req.body);
    if(error){
        res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code,error))     
        return 
    }  
    try {
        await Driver.update(req.body, {
            where: {
                id: req.params.id,
                isDeleted:false
            }
        })
            .then(result => {
                if (result[0]) {
                    res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code, `driver ${req.params.id} updated successfully ${result}`))
                }
                else {
                    res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, `No driver are available for driver_ID: ${req.params.id}`))
                }
            }
            )
            .catch(err =>
                res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, err))
            )

    }
    catch (error) {
        res.status(httpStatusCodes[500].code).json(formResponse(httpStatusCodes[500].code, error))
    }

}

exports.deleteDriver = async (req, res) => {
    const {error,value}=deleteDriverSchema.validate({
        id:req.params.id
    });
    if(error){
        res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code,error))     
        return 
    }  
    try {

        const deleteDriver=await Driver.update({
            isDeleted:true
        },{
            where:{
                id:req.params.id,
                isDeleted:false
            }
        })
        console.log(deleteDriver)
        if(deleteDriver[0]){
           return res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code, `driver ${req.params.id} deleted successfully `))
        }
        else{
            res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, `No driver are available for driver_ID: ${req.params.id}`))
        }

    }
    catch (error) {
        res.status(httpStatusCodes[500].code).json(formResponse(httpStatusCodes[500].code, error))
    }

}

exports.getDriverById=async(req,res)=>{
    
    const {error,value}=getDriverById.validate({
        id:req.params.id,
    });
    if(error){
        res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code,error))     
        return 
    }  

    const result=await Driver.findOne({
        where:{
            id:req.params.id
        }
    })

    if(result){
        return  res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code,result))
    }
    else{
        return  res.status(httpStatusCodes[404].code).json(formResponse(httpStatusCodes[404].code,"Driver ID is Invalid"))
    }
}


exports.getRideDetails=async(req,res)=>{
    const {error,value}=getRideDetailsSchema.validate({
        id:req.params.id,
        pickup:req.body.pickup
    });
    if(error){
        res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code,error))     
        return 
    }  

    const pickup=req.body.pickup
    console.log(pickup)
    if(pickup == 'true')
    {
        let booking=await PickCustomer.findAll({
            where:{
                driver:req.params.id
            }
        })
       if(booking.length==0){
        return res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code,"No booking available"))
       }
       else{
       return res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code,{
            "pickup":booking
        }))
       }
    }
    else
    {
        let booking=await DropCustomer.findAll({
            where:{
                driver:req.params.id
            }
        })
        if(booking.length==0){
          return  res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code,"No booking available"))
           }
           else{
          return  res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code,{
                "dropoff":booking
            }))
        
           }
    }
}

