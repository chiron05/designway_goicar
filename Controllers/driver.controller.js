const httpStatusCodes = require('../Constants/http-status-codes');
const { formResponse } = require('../Utils/helper');
const PickCustomer = require('../Models/pickCustomer.model')
const DropCustomer = require('../Models/dropCustomer.model')
const Driver = require('../Models/Driver.js')
const { Op, Sequelize } = require('sequelize')
const cloudinary = require('../Utils/cloudinary');
const { createDriverSchema, updateDriverSchema, getRideDetailsSchema, deleteDriverSchema, getDriverById } = require('../Joi/driver.validation');
const pickupDriversBooking = require('../Models/pickupDriversBooking.model');
const dropoffDriversBooking = require('../Models/dropoffDriversBooking.model');
const User = require('../Models/User');
const Booking = require('../Models/booking.model');
const Vehicle = require('../Models/Vehicle');
const Customer = require('../Models/customer.model');

const { uploadToS3 } = require('../Utils/digitalOceanConfig')

exports.getDrivers = async (req, res) => {
    let skip = 10 * (req.query.page);
    await Driver.findAll({
        where: {
            isDeleted: false
        },
        limit: 10,
        offset: skip
    }).then(result => {
       return res.status(httpStatusCodes[200].code)
            .json(formResponse(httpStatusCodes[200].code, result))
    }).catch(err => {
      return  res.status(httpStatusCodes[404].code)
            .json(formResponse(httpStatusCodes[404].code, err))
    })
}

exports.removeAdditionalPickupDriver=async(req,res)=>{
    const removePickupDriver=await pickupDriversBooking.destroy({
        where:{
            pickup_id:req.body.pickup_id,
            driver_id:req.body.driver_id
        }
    })

    if(removePickupDriver){
        const updateDriver=await Driver.update({
            isAvailable:true
        },{
            where:{
                id:req.body.driver_id
            }
        })
        return res.status(httpStatusCodes[200].code)
        .json(formResponse(httpStatusCodes[200].code, "Additional driver removed"))
    }else{
        return res.status(httpStatusCodes[400].code)
        .json(formResponse(httpStatusCodes[400].code, "Please provide valid pickup and driver id"))
    }
}

exports.removeAdditionalDropOffDriver=async(req,res)=>{
    const removedropoffDriver=await dropoffDriversBooking.destroy({
        where:{
            dropoff_id:req.body.dropoff_id,
            driver_id:req.body.driver_id
        }
    })

    if(removedropoffDriver){
        const updateDriver=await Driver.update({
            isAvailable:true
        },{
            where:{
                id:req.body.driver_id
            }
        })
        return res.status(httpStatusCodes[200].code)
        .json(formResponse(httpStatusCodes[200].code, "Additional driver removed"))
    }else{
        return res.status(httpStatusCodes[400].code)
        .json(formResponse(httpStatusCodes[400].code, "Please provide valid dropoff and driver id"))
    }
}

exports.additonalPickUpDriver = async (req, res) => {
    const pickUpdetails = await PickCustomer.findOne({
        where: {
            _id: req.body.pickup_id,
            isDeleted: false
        }
    })

    const driverDetails = await Driver.findOne({
        where: {
            id: req.body.driver_id,
            isDeleted: false,
            isAvailable: false
        }
    })

    if (driverDetails) {
        return res.status(httpStatusCodes[404].code)
            .json(formResponse(httpStatusCodes[404].code, "Driver Unavailable"))
    }
    if (pickUpdetails) {
        const additonalDriver = await pickupDriversBooking.create({
            booking_id: pickUpdetails.booking_id,
            pickup_id: req.body.pickup_id,
            driver_id: req.body.driver_id
        })
        const updateDriver = await Driver.update({
            isAvailable: false
        }, {
            where: {
                id: req.body.driver_id,
                isDeleted: false
            }
        })

        return res.status(httpStatusCodes[200].code)
            .json(formResponse(httpStatusCodes[200].code, "Additional Driver added successfully"))
    }
    else {
        return res.status(httpStatusCodes[404].code)
            .json(formResponse(httpStatusCodes[404].code, "Invalid PickUp ID"))
    }
}

exports.additonalDrpOffDriver = async (req, res) => {
    const dropOffdetails = await DropCustomer.findOne({
        where: {
            _id: req.body.dropOff_id
        }
    })

    const driverDetails = await Driver.findOne({
        where: {
            id: req.body.driver_id,
            isDeleted: false,
            isAvailable: false
        }
    })

    if (driverDetails) {
        return res.status(httpStatusCodes[404].code)
            .json(formResponse(httpStatusCodes[404].code, "Driver Unavailable"))
    }
    if (dropOffdetails) {
        const additonalDriver = await dropoffDriversBooking.create({
            booking_id: dropOffdetails.booking_id,
            dropoff_id: req.body.dropOff_id,
            driver_id: req.body.driver_id
        })
        const updateDriver = await Driver.update({
            isAvailable: false
        }, {
            where: {
                id: req.body.driver_id,
                isDeleted: false
            }
        })
        return res.status(httpStatusCodes[200].code)
            .json(formResponse(httpStatusCodes[200].code, "Additional Driver added successfully"))
    }
    else {
        return res.status(httpStatusCodes[404].code)
            .json(formResponse(httpStatusCodes[404].code, "Invalid Drop Off ID"))
    }
}

exports.createDriver = async (req, res) => {

    if (Object.keys(req.body).length === 0) {
        return res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, "Body is empty"))
    }

    const userEmail = User.findOne({
        where: {
            email: req.body.email,
            isDeleted: false
        }
    })

    const userPhoneNumber = User.findOne({
        where: {
            phone_number: req.body.phone_number,
            isDeleted: false
        }
    })

    const result = await Promise.all([userEmail, userPhoneNumber])
    if (result[0]) {
        return res.status(httpStatusCodes[400].code)
            .json(formResponse(httpStatusCodes[400].code, "Email ID Already in Used"))
    }

    if (result[0]) {
        return res.status(httpStatusCodes[400].code)
            .json(formResponse(httpStatusCodes[400].code, "Phone number Already in Used"))
    }


    if (req.body.phone_number == req.body.alternate_number) {
        res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, `Alternate phonenumber must be different`))
        return;
    }
    try {
        console.log(req.file.path)

       
        const driver_LicenseLink = await uploadToS3(req.file, 'driver_license')

        console.log(result)
            const {error,value}=createDriverSchema.validate({
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                phone_number: req.body.phone_number,
                alternate_number: req.body.alternate_number,
                email: req.body.email,
                license_no: req.body.license_no,
                license_img: driver_LicenseLink.Location,
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


            let driver = Driver.build({
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                phone_number: req.body.phone_number,
                alternate_number: req.body.alternate_number,
                email: req.body.email,
                license_no: req.body.license_no,
                license_img: driver_LicenseLink.Location
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
                    first_name:driver.first_name,
                    last_name:driver.last_name,
                    phone_number:driver.phone_number,
                    email:driver.email,
                    password:req.body.password,
                    id_proof:driver.license_img         
                })


               return res.status(httpStatusCodes[200].code)
                    .json(formResponse(httpStatusCodes[200].code, {
                        "message":"driver created successfully",
                        driver,
                        "password":req.body.password
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
    if (Object.keys(req.body).length === 0) {
        return res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, "Body is empty"))
    }

    const { error, value } = updateDriverSchema.validate(req.body);
    if (error) {
        res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, error))
        return
    }
    try {
        await Driver.update(req.body, {
            where: {
                id: req.params.id,
                isDeleted: false
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
    const { error, value } = deleteDriverSchema.validate({
        id: req.params.id
    });
    if (error) {
        res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, error))
        return
    }
    try {

        const deleteDriver = await Driver.update({
            isDeleted: true
        }, {
            where: {
                id: req.params.id,
                isDeleted: false
            }
        })
        console.log(deleteDriver)
        if (deleteDriver[0]) {
            return res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code, `driver ${req.params.id} deleted successfully `))
        }
        else {
            res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, `No driver are available for driver_ID: ${req.params.id}`))
        }

    }
    catch (error) {
        res.status(httpStatusCodes[500].code).json(formResponse(httpStatusCodes[500].code, error))
    }

}

exports.getDriverById = async (req, res) => {

    const { error, value } = getDriverById.validate({
        id: req.params.id,
    });
    if (error) {
        res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, error))
        return
    }

    const result = await Driver.findOne({
        where: {
            id: req.params.id,
            isDeleted: false
        }
    })

    if (result) {
        return res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code, result))
    }
    else {
        return res.status(httpStatusCodes[404].code).json(formResponse(httpStatusCodes[404].code, "Driver ID is Invalid"))
    }
}


exports.getRideDetails = async (req, res) => {
 const driver_ID=req.params.id;

 const pickCustomerDetails= PickCustomer.findAll({
    where:{
        driver:driver_ID,
        isDeleted:false
    },
    attributes:["_id","booking_id"]
 })
 const dropCustomerDetails= DropCustomer.findAll({
    where:{
        driver:driver_ID,
        isDeleted:false
    },
    attributes:["_id","booking_id"]
 })
 const result=await Promise.all([pickCustomerDetails,dropCustomerDetails])
 const pickCustomerResult=result[0]
 const dropCustomerResult=result[1]

 let driverRideDetails=[]

 if(pickCustomerResult.length!=0){
    for(let i=0;i<pickCustomerResult.length;i++){
     let res=await  Booking.findOne({
            where:{
                isDeleted:false,
                _id:pickCustomerResult[i].booking_id
            },
            attributes:["_id","customer_id","pickup_date","pickup_time","pickup_location","pick_up_address","pickup_date"]
        }).then((booking_details)=>{
          return Customer.findOne({
                where:{
                    isDeleted:false,
                    _id:booking_details.customer_id
                },
                attributes:["_id","firstName","lastName"]
            }).then((customer_Details)=>{
                driverRideDetails.push({
                    "BookingId":booking_details._id,
                    "PickUpId":pickCustomerResult[i]._id,
                    "Ride":"Pick-Up",
                    "Time":booking_details.pickup_time,
                    "Date":booking_details.pickup_date,
                    "Location":booking_details.pickup_location,
                    "CustomerDetails":{
                        "CustomerId":customer_Details._id,
                        "FirstName":customer_Details.firstName,
                        "LastName":customer_Details.lastName,
                        "Pickup_address":booking_details.pick_up_address
                    }
                })
                return driverRideDetails
                // console.log(driverRideDetails)
            }).catch(err=>{
                return res.status(httpStatusCodes[500].code)
                .json(formResponse(httpStatusCodes[500].code, err))
            })
        }).catch(err=>{
           return res.status(httpStatusCodes[500].code)
            .json(formResponse(httpStatusCodes[500].code, err))
        })
      
        
    }

 }

 if(dropCustomerResult.length!=0){
    for(let i=0;i<dropCustomerResult.length;i++){
        let res=await  Booking.findOne({
               where:{
                   isDeleted:false,
                   _id:dropCustomerResult[i].booking_id
               },
               attributes:["_id","customer_id","dropoff_date","dropoff_time","dropoff_location","drop_off_address","dropoff_date"]
           }).then((booking_details)=>{
             return Customer.findOne({
                   where:{
                       isDeleted:false,
                       _id:booking_details.customer_id
                   },
                   attributes:["_id","firstName","lastName"]
               }).then((customer_Details)=>{
                   driverRideDetails.push({
                       "BookingId":booking_details._id,
                       "DropOffId":dropCustomerResult[i]._id,
                       "Ride":"Drop-Off",
                       "Time":booking_details.dropoff_time,
                       "Date":booking_details.dropoff_date,
                       "Location":booking_details.dropoff_location,
                       "CustomerDetails":{
                           "CustomerId":customer_Details._id,
                           "FirstName":customer_Details.firstName,
                           "LastName":customer_Details.lastName,
                           "Dropoff_address":booking_details.drop_off_address
                       }
                   })
                   return driverRideDetails
                   // console.log(driverRideDetails)
               }).catch(err=>{
                   return res.status(httpStatusCodes[500].code)
                   .json(formResponse(httpStatusCodes[500].code, err))
               })
           }).catch(err=>{
              return res.status(httpStatusCodes[500].code)
               .json(formResponse(httpStatusCodes[500].code, err))
           })  
       }
 }

 const sortableData= driverRideDetails.map(data=>{
    const monthNumber={
        "Jan":"1",
        "Feb":"2",
        "Mar":"3",
        "Apr":"4",
        "May":"5",
        "Jun":"6",
        "Jul":"7",
        "Aug":"8",
        "Sep":"9",
        "Oct":"10",
        "Nov":"11",
        "Dec":"12"
    }
    const [hours,minutes,seconds]=data.Time.split(':');
    console.log(data.Date)
    console.log(data.Date.toString())
    const [day,month,date,year]=data.Date.toString().split(' ')
    console.log(monthNumber[month]+" --"+date+"-- "+year+"--"+hours+"-"+minutes,"--"+seconds)
    
    return {
        ...data,
        new_Date:new Date(year.toString(),monthNumber[month].toString(),date.toString(),hours.toString(),minutes.toString(),seconds.toString())
    }
 })
 sortableData.sort((a,b)=>a.new_Date-b.new_Date)

return res.status(httpStatusCodes[200].code)
.json(formResponse(httpStatusCodes[200].code, sortableData))

}

exports.getDriverByPhone = async (req, res) => {

    Driver.findOne({
        where: {
            phone_number: req.params.no,
        }
    }).then(result => {

        if (result) {
            return res.status(httpStatusCodes[200].code)
                .json(formResponse(httpStatusCodes[200].code, result))
        } else {
            return res.status(httpStatusCodes[404].code)
                .json(formResponse(httpStatusCodes[404].code, "No Driver available"))
        }

    }).catch(err => {
        res.status(httpStatusCodes[500].code)
            .json(formResponse(httpStatusCodes[500].code, err))
    })
}


exports.getDriverByName = async (req, res) => {
    console.log(req.body)
    Driver.findAll({
        where: {
            first_name: req.body.first_name,
            last_name:req.body.last_name,
            isDeleted: false
        }
    }).then(result => {

        if (result[0]) {
            return res.status(httpStatusCodes[200].code)
                .json(formResponse(httpStatusCodes[200].code, result))
        } else {
            return res.status(httpStatusCodes[404].code)
                .json(formResponse(httpStatusCodes[404].code, "No Driver available"))
        }

    }).catch(err => {
        res.status(httpStatusCodes[500].code)
            .json(formResponse(httpStatusCodes[500].code, err))
    })
}

exports.getUpcomingRideDetails=async(req,res)=>{
    const driver_ID=req.params.id;

    const pickCustomerDetails= PickCustomer.findAll({
       where:{
           driver:driver_ID,
           isDeleted:false,
           status:"Upcoming"
       },
       attributes:["_id","booking_id"]
    })
    const dropCustomerDetails= DropCustomer.findAll({
       where:{
           driver:driver_ID,
           isDeleted:false,
           status:"Upcoming"
       },
       attributes:["_id","booking_id"]
    })
    const result=await Promise.all([pickCustomerDetails,dropCustomerDetails])
    const pickCustomerResult=result[0]
    const dropCustomerResult=result[1]
   
    let driverRideDetails=[]
   
    if(pickCustomerResult.length!=0){
       for(let i=0;i<pickCustomerResult.length;i++){
        let res=await  Booking.findOne({
               where:{
                   isDeleted:false,
                   _id:pickCustomerResult[i].booking_id
               },
               attributes:["_id","customer_id","pickup_date","pickup_time","pickup_location","pick_up_address","pickup_date"]
           }).then((booking_details)=>{
             return Customer.findOne({
                   where:{
                       isDeleted:false,
                       _id:booking_details.customer_id
                   },
                   attributes:["_id","firstName","lastName"]
               }).then((customer_Details)=>{
                   driverRideDetails.push({
                       "BookingId":booking_details._id,
                       "PickUpId":pickCustomerResult[i]._id,
                       "Ride":"Pick-Up",
                       "Time":booking_details.pickup_time,
                       "Date":booking_details.pickup_date,
                       "Location":booking_details.pickup_location,
                       "CustomerDetails":{
                           "CustomerId":customer_Details._id,
                           "FirstName":customer_Details.firstName,
                           "LastName":customer_Details.lastName,
                           "Pickup_address":booking_details.pick_up_address,
                           "Status":"Upcoming"
                       }
                   })
                   return driverRideDetails
                   // console.log(driverRideDetails)
               }).catch(err=>{
                   return res.status(httpStatusCodes[500].code)
                   .json(formResponse(httpStatusCodes[500].code, err))
               })
           }).catch(err=>{
              return res.status(httpStatusCodes[500].code)
               .json(formResponse(httpStatusCodes[500].code, err))
           })
         
           
       }
   
    }
   
    if(dropCustomerResult.length!=0){
       for(let i=0;i<dropCustomerResult.length;i++){
           let res=await  Booking.findOne({
                  where:{
                      isDeleted:false,
                      _id:dropCustomerResult[i].booking_id
                  },
                  attributes:["_id","customer_id","dropoff_date","dropoff_time","dropoff_location","drop_off_address","dropoff_date"]
              }).then((booking_details)=>{
                return Customer.findOne({
                      where:{
                          isDeleted:false,
                          _id:booking_details.customer_id
                      },
                      attributes:["_id","firstName","lastName"]
                  }).then((customer_Details)=>{
                      driverRideDetails.push({
                          "BookingId":booking_details._id,
                          "DropOffId":dropCustomerResult[i]._id,
                          "Ride":"Drop-Off",
                          "Time":booking_details.dropoff_time,
                          "Date":booking_details.dropoff_date,
                          "Location":booking_details.dropoff_location,
                          "CustomerDetails":{
                              "CustomerId":customer_Details._id,
                              "FirstName":customer_Details.firstName,
                              "LastName":customer_Details.lastName,
                              "Dropoff_address":booking_details.drop_off_address,
                              "Status":"Upcoming"
                          }
                      })
                      return driverRideDetails
                      // console.log(driverRideDetails)
                  }).catch(err=>{
                      return res.status(httpStatusCodes[500].code)
                      .json(formResponse(httpStatusCodes[500].code, err))
                  })
              }).catch(err=>{
                 return res.status(httpStatusCodes[500].code)
                  .json(formResponse(httpStatusCodes[500].code, err))
              })  
          }
    }
   
    const sortableData= driverRideDetails.map(data=>{
       const monthNumber={
           "Jan":"1",
           "Feb":"2",
           "Mar":"3",
           "Apr":"4",
           "May":"5",
           "Jun":"6",
           "Jul":"7",
           "Aug":"8",
           "Sep":"9",
           "Oct":"10",
           "Nov":"11",
           "Dec":"12"
       }
       const [hours,minutes,seconds]=data.Time.split(':');
       console.log(data.Date)
       console.log(data.Date.toString())
       const [day,month,date,year]=data.Date.toString().split(' ')
       console.log(monthNumber[month]+" --"+date+"-- "+year+"--"+hours+"-"+minutes,"--"+seconds)
       
       return {
           ...data,
           new_Date:new Date(year.toString(),monthNumber[month].toString(),date.toString(),hours.toString(),minutes.toString(),seconds.toString())
       }
    })
    sortableData.sort((a,b)=>a.new_Date-b.new_Date)
   
   return res.status(httpStatusCodes[200].code)
   .json(formResponse(httpStatusCodes[200].code, sortableData))
   
}

exports.getcompletedRideDetails=async(req,res)=>{
    const driver_ID=req.params.id;

    const pickCustomerDetails= PickCustomer.findAll({
       where:{
           driver:driver_ID,
           isDeleted:false,
           status:"Completed"
       },
       attributes:["_id","booking_id"]
    })
    const dropCustomerDetails= DropCustomer.findAll({
       where:{
           driver:driver_ID,
           isDeleted:false,
           status:"Completed"
       },
       attributes:["_id","booking_id"]
    })
    const result=await Promise.all([pickCustomerDetails,dropCustomerDetails])
    const pickCustomerResult=result[0]
    const dropCustomerResult=result[1]
   
    let driverRideDetails=[]
   
    if(pickCustomerResult.length!=0){
       for(let i=0;i<pickCustomerResult.length;i++){
        let res=await  Booking.findOne({
               where:{
                   isDeleted:false,
                   _id:pickCustomerResult[i].booking_id
               },
               attributes:["_id","customer_id","pickup_date","pickup_time","pickup_location","pick_up_address","pickup_date"]
           }).then((booking_details)=>{
             return Customer.findOne({
                   where:{
                       isDeleted:false,
                       _id:booking_details.customer_id
                   },
                   attributes:["_id","firstName","lastName"]
               }).then((customer_Details)=>{
                   driverRideDetails.push({
                       "BookingId":booking_details._id,
                       "PickUpId":pickCustomerResult[i]._id,
                       "Ride":"Pick-Up",
                       "Time":booking_details.pickup_time,
                       "Date":booking_details.pickup_date,
                       "Location":booking_details.pickup_location,
                       "CustomerDetails":{
                           "CustomerId":customer_Details._id,
                           "FirstName":customer_Details.firstName,
                           "LastName":customer_Details.lastName,
                           "Pickup_address":booking_details.pick_up_address,
                           "Status":"Completed"
                       }
                   })
                   return driverRideDetails
                   // console.log(driverRideDetails)
               }).catch(err=>{
                   return res.status(httpStatusCodes[500].code)
                   .json(formResponse(httpStatusCodes[500].code, err))
               })
           }).catch(err=>{
              return res.status(httpStatusCodes[500].code)
               .json(formResponse(httpStatusCodes[500].code, err))
           })
         
           
       }
   
    }
   
    if(dropCustomerResult.length!=0){
       for(let i=0;i<dropCustomerResult.length;i++){
           let res=await  Booking.findOne({
                  where:{
                      isDeleted:false,
                      _id:dropCustomerResult[i].booking_id
                  },
                  attributes:["_id","customer_id","dropoff_date","dropoff_time","dropoff_location","drop_off_address","dropoff_date"]
              }).then((booking_details)=>{
                return Customer.findOne({
                      where:{
                          isDeleted:false,
                          _id:booking_details.customer_id
                      },
                      attributes:["_id","firstName","lastName"]
                  }).then((customer_Details)=>{
                      driverRideDetails.push({
                          "BookingId":booking_details._id,
                          "DropOffId":dropCustomerResult[i]._id,
                          "Ride":"Drop-Off",
                          "Time":booking_details.dropoff_time,
                          "Date":booking_details.dropoff_date,
                          "Location":booking_details.dropoff_location,
                          "CustomerDetails":{
                              "CustomerId":customer_Details._id,
                              "FirstName":customer_Details.firstName,
                              "LastName":customer_Details.lastName,
                              "Dropoff_address":booking_details.drop_off_address,
                              "Status":"Completed"
                          }
                      })
                      return driverRideDetails
                      // console.log(driverRideDetails)
                  }).catch(err=>{
                      return res.status(httpStatusCodes[500].code)
                      .json(formResponse(httpStatusCodes[500].code, err))
                  })
              }).catch(err=>{
                 return res.status(httpStatusCodes[500].code)
                  .json(formResponse(httpStatusCodes[500].code, err))
              })  
          }
    }
   
    const sortableData= driverRideDetails.map(data=>{
       const monthNumber={
           "Jan":"1",
           "Feb":"2",
           "Mar":"3",
           "Apr":"4",
           "May":"5",
           "Jun":"6",
           "Jul":"7",
           "Aug":"8",
           "Sep":"9",
           "Oct":"10",
           "Nov":"11",
           "Dec":"12"
       }
       const [hours,minutes,seconds]=data.Time.split(':');
       console.log(data.Date)
       console.log(data.Date.toString())
       const [day,month,date,year]=data.Date.toString().split(' ')
       console.log(monthNumber[month]+" --"+date+"-- "+year+"--"+hours+"-"+minutes,"--"+seconds)
       
       return {
           ...data,
           new_Date:new Date(year.toString(),monthNumber[month].toString(),date.toString(),hours.toString(),minutes.toString(),seconds.toString())
       }
    })
    sortableData.sort((a,b)=>a.new_Date-b.new_Date)
   
   return res.status(httpStatusCodes[200].code)
   .json(formResponse(httpStatusCodes[200].code, sortableData))
   
}

exports.getDriverHistory = async (req, res) => {

    try {

        const driver = Driver.findOne({
            where: {
                id: req.params.id,
                isDeleted: false
            }
        })

        const pickUpDetails = PickCustomer.findAll({
            where: {
                driver: req.params.id,
                isDeleted: false
            }
        })

        const dropOffDetails = DropCustomer.findAll({

            where: {
                driver: req.params.id,
                isDeleted: false
            }
        })

        const result = await Promise.all([driver, pickUpDetails, dropOffDetails])
        const pickup = result[1];
        const dropoff = result[2];


        let allPickUp = []



        let allDropOff = []



        for (let i = 0; i < result[1].length; i++) {

            const booking_details = await Booking.findOne({
                attributes: ["vehicle_id", "_id", "pickup_location", "customer_id"],
                where: {
                    _id: pickup[i].booking_id,
                    isDeleted: false
                }
            })

            const vehicle_Details = await Vehicle.findOne({
                attributes: ["type"],
                where: {
                    id: booking_details.dataValues.vehicle_id,
                    isDeleted: false
                }
            })


            const customerDetails = await Customer.findOne({
                attributes: ["firstName", "lastName"],
                where: {
                    _id: booking_details.customer_id,
                    isDeleted: false
                }
            })



            allPickUp = [
                {
                    "booking_id": booking_details._id,
                    "pickup/dropoff": "PickUp",
                    "location": booking_details.pickup_location,
                    "customer": `${customerDetails.firstName} ${customerDetails.lastName}`,
                    "vehicle-type": vehicle_Details.dataValues.type,
                    "status": pickup[i].status,

                },
                ...allPickUp
            ]
        }


        for (let i = 0; i < result[2].length; i++) {
            const booking_details = await Booking.findOne({
                attributes: ["vehicle_id", "_id", "pickup_location", "customer_id", "dropoff_location"],
                where: {
                    _id: dropoff[i].booking_id,
                    isDeleted: false
                }
            })

            const vehicle_Details = await Vehicle.findOne({
                attributes: ["type"],
                where: {
                    id: booking_details.vehicle_id,
                    isDeleted: false
                }
            })

            const customerDetails = await Customer.findOne({
                attributes: ["firstName", "lastName"],
                where: {
                    _id: booking_details.customer_id,
                    isDeleted: false
                }
            })

            allDropOff = [
                {
                    "booking_id": booking_details._id,
                    "pickup/dropoff": "DropOff",
                    "location": booking_details.dropoff_location,
                    "customer": `${customerDetails.firstName} ${customerDetails.lastName}`,
                    "vehicle-type": vehicle_Details.type,
                    "status": dropoff[i].status,
                },
                ...allDropOff
            ]
        }

        let history = {
            allPickUp,
            allDropOff
        }


        return res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code, history))
    } catch (error) {
        console.log(error)
        return res.status(httpStatusCodes[500].code).json(formResponse(httpStatusCodes[500].code))
    }

}
