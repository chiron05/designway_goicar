const path = require('path')
const Booking = require('../Models/booking.model')
const PickCustomer = require('../Models/pickCustomer.model')
const DropCustomer = require('../Models/dropCustomer.model')
const Customer = require('../Models/customer.model')
const cloudinary = require('../Utils/cloudinary')
const Driver = require('../Models/Driver')
const { emailNotify } = require('../services/email')
const { whatsappNotify, whatsappPickCustomerNotify, whatsappDriverNotify, whatsappDropCustomerNotify } = require('../services/whatsapp')
const { formResponse } = require('../Utils/helper')
const httpStatusCodes = require('../Constants/http-status-codes')
const shortUrl = require('../Models/shortUrl.model')
const Payment = require("../Models/payment.model")
const request = require('request');
const crypto = require("crypto");
const axios = require('axios')
const jsSHA = require("jssha");
const { confirmBookingSchema, updateBookingSchema, createBookingSchema, pickUpDropOffSchema, updatePickDropSchema, bookingCancellationSchema } = require('../Joi/booking.validation')
const { model } = require('mongoose')
const dropoffDriversBooking = require('../Models/dropoffDriversBooking.model')
const pickupDriversBooking = require('../Models/pickupDriversBooking.model')
const db=require('../config/db')
const Vendor = require('../Models/Vendor')
const Vehicle = require('../Models/Vehicle')
const { YearlyInstance } = require('twilio/lib/rest/api/v2010/account/usage/record/yearly')
const { sms, sms_booking } = require('../services/sms')



exports.confirmBooking = async (req, res) => {
    let validationObject = {
        bookingid: req.query.bookingId
    }
    const { error, value } = confirmBookingSchema.validate(validationObject);
    if (error) {

        res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, error))
    }
    else {
        let uniqueID = Math.random().toString(36).replace(/[^a-z0-9]/gi, '').substring(2, 10);
        const bookingdetails = await Booking.findOne({
            where: {
                _id: req.query.bookingId,
                isDeleted: false,
                booking_status: 'pending'
            }
        })
        if (bookingdetails) {
            try {
                let data = shortUrl.build({
                    bookingid: req.query.bookingId,
                    shorturlid: uniqueID
                })
                await data.save();
                res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code, {
                    "Url": `http://localhost:3000/shorturl/${uniqueID}`
                }))
            } catch (error) {

                res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, error))
            }
        }
        else {
            res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, "No booking found"))
        }

    }

}

exports.updateVehicleBooking = async (req, res) => {
    if (Object.keys(req.body).length === 0) {
        return res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, "Body is empty"))
    }

    let validationObject = {
        ...req.body,
        bookingid: req.params.id
    }
    const { error, value } = updateBookingSchema.validate(validationObject);
    if (error) {
        return res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, error))
    }
    else {
        try {
            Booking.update(
                req.body,
                { where: { _id: req.params.id, isDeleted: false, booking_status: 'pending' } }
            )
                .then(result => {
                    if (result[0]) {
                        res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code, `Booking Updated Successfully`))
                    }
                    else {
                        res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, `No Bookings are available for BookingID: ${req.params.id}`))
                    }
                }
                )
                .catch(err =>
                    res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, err))
                )
        } catch (error) {
            res.status(httpStatusCodes[500].code).json(formResponse(httpStatusCodes[500].code, error))
        }
    }

}




exports.createVehicleBooking = async (req, res) => {
    const vehicleDetails=await Vehicle.findOne({
        where:{
            id:req.body.vehicle_id
        },

        attributes:["id","isBooked"]
    })
    if(!vehicleDetails){
        return res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, "Vehicle ID is Invalid"));
    }
    console.log(vehicleDetails.isBooked)
    if(vehicleDetails.isBooked==1){
       return res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, "Vehicle not available"))
    }
  
    const { error, value } = createBookingSchema.validate(
        {
            customer_id: req.body.customer_id,
            vehicle_id: req.body.vehicle_id,
            pickup_date: req.body.pickup_date,
            dropoff_date: req.body.dropoff_date,
            pickup_location: req.body.pickup_location,
            dropoff_location: req.body.dropoff_location,
            duration: req.body.duration,
            total_rent:req.body.total_rent,
            deposit_amount:req.body.deposit_amount,
            per_day_rent:req.body.per_day_rent
        }
    );
    if (error) {
        res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, error))
    }
    else {
        try {

            const customer = await Customer.findOne({
                where: {
                    _id: req.body.customer_id
                },
                attributes: ["_id","email","firstName","phoneNumber"]
            })

            if (!customer) {
                return res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, "Customer ID is Invalid"));
            }
            let data = Booking.build({
                customer_id: req.body.customer_id,
                vehicle_id: req.body.vehicle_id,
                pickup_date: req.body.pickup_date,
                pickup_time: req.body.pickup_time,
                dropoff_date: req.body.dropoff_date,
                dropoff_time: req.body.dropoff_time,
                pickup_location: req.body.pickup_location,
                dropoff_location: req.body.dropoff_location,
                duration: req.body.duration,
                total_rent:req.body.total_rent,
                deposit_amount:req.body.deposit_amount,
                per_day_rent:req.body.per_day_rent
            })
            await data.save();

            const vehicleAvaibilityUpdation=await Vehicle.update({
                isBooked:true
            },{
                where:{
                    id:req.body.vehicle_id
                },
                attributes:["id"]
            })

            if (data.errors) {
                res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, data.error))
            }
            else {
                sms_booking( req.body.customer_id,data._id,customer.phoneNumber,customer.firstName);
               
                emailNotify(customer.email,"subject",
            `Hello ${customer.firstName}

             You have received a link from Goicar. 
             Here is your booking link ${process.env.SHORT_URL_DOMAIN}/track/${req.body.customer_id}/${data._id} please click on the link to update your booking details.

             Click here: ${process.env.SHORT_URL_DOMAIN}/${data._id}`)

                res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code, {
                    "message":"Booking done successfully",
                    data
                }))
            }
        } catch (error) {
          
            res.status(httpStatusCodes[500].code).json(formResponse(httpStatusCodes[500].code, error))
        }
    }
}


exports.updatepickup = async (req, res) => {

    if (Object.keys(req.body).length === 0) {
        return res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, "Body is empty"))
    }

    let validationObject = {
        ...req.body,
        searchBookingId: req.params.id
    }
    const { error, value } = updatePickDropSchema.validate(validationObject);

    if (error) {
        res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, error))
    } else {
        try {
            const cancelledBooking = await Booking.findOne({
                where: {
                    _id: req.params.id,
                    booking_status: 'cancelled'
                }
            })

            if (cancelledBooking) {
                return res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, `Booking for this pickup is already cancelled`))
            }



            PickCustomer.update(
                req.body,
                { where: { booking_id: req.params.id, isDeleted: false } }
            )
                .then(result => {
                    if (result[0]) {
                        res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code, `PickUp for booking:${req.params.id} updated successfully ${result}`))
                    }
                    else {
                        res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, `No Bookings are available for BookingID: ${req.params.id}`))
                    }
                }
                )
                .catch(err =>
                    res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, err))
                )
        } catch (error) {
            console.log(error)
            res.status(httpStatusCodes[500].code).json(formResponse(httpStatusCodes[500].code, error))
        }
    }
}

exports.pickup = async (req, res) => {
    if (Object.keys(req.body).length === 0) {
        return res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, "Body is empty"))
    }

    const { error, value } = pickUpDropOffSchema.validate(req.body);

    if (error) {
        res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, error))
    }
    else {
        try {

            const DriverDetails = await Driver.findOne({
                where: {
                    id: req.body.driverId,
                    isDeleted: false,
                    isAvailable:true
                }
            })
            console.log(DriverDetails)

            if(!DriverDetails){
              
              return  res.status(httpStatusCodes[400].code)
                .json(formResponse(httpStatusCodes[400].code,  "Please provide valid Driver ID"))
      
            }

            const booking_details = await Booking.findOne({
                where: {
                    _id: req.body.booking_id,
                    booking_status: "pending",
                    isDeleted:false
                },
                attributes: ["_id","customer_id","pickup_date","pickup_time","pickup_location","dropoff_date","dropoff_time","dropoff_location"]
            })

           

            if (!booking_details) {
                return res.status(httpStatusCodes[400].code)
                    .json(formResponse(httpStatusCodes[400].code, "Booking ID is InValid"))
            }
            const customerDetails = await Customer.findOne({
                attributes: ["firstName","lastName","email", "phoneNumber"],
                where: {
                    _id: booking_details.dataValues.customer_id,
                    isDeleted: false
                }
            })
          
            if (!DriverDetails || !customerDetails) {
                res.status(httpStatusCodes[400].code)
                    .json(formResponse(httpStatusCodes[400].code,  "Please provide valid Data"))
                return;
            }

            const pickUp = await PickCustomer.create(
                {
                    booking_id: req.body.booking_id,
                    driver: req.body.driverId,
                    vehicle_condition: req.body.vehicle_condition,
                    fuel_km:req.body.fuel_km,
                    fuel_tank:req.body.fuel_tank
                }
            )
            
            const driverAvabilityUpdation=await Driver.update({
                isAvailable:false
            },{
               where:{
                id:req.body.driverId
               }
            })

            let customerEmail=`
                Hello ${customerDetails.firstName+" "+customerDetails.lastName}

                Your Pickup Details
                Booking ID : ${req.body.booking_id}
                Pickup location : ${booking_details.pickup_location}
                Pickup Date :  ${booking_details.pickup_date}
                Pickup time :  ${booking_details.pickup_time}

                Driver :  ${DriverDetails.full_name} 
                Driver phone number :  ${DriverDetails.phone_number}
            `

            let driverEmail=`
            Hello ${DriverDetails.full_name} 

            You having a pickup 
            location : ${booking_details.pickup_location}
            date : ${booking_details.pickup_date}
            time: ${booking_details.pickup_time}

            Customer Name :  ${customerDetails.firstName+" "+customerDetails.lastName}
            Customer Phone number : ${customerDetails.phoneNumber}
            `
            const CustomerEmailError = await emailNotify(customerDetails.email, 'Pickup registration done successfully',customerEmail);

            whatsappPickCustomerNotify(customerDetails.firstName+" "+customerDetails.lastName,req.body.booking_id,booking_details.pickup_location,booking_details.pickup_date,booking_details.pickup_time,DriverDetails.full_name,DriverDetails.phone_number,customerDetails.phoneNumber)

            const DriverEmailError = await emailNotify(DriverDetails.email,"", driverEmail);

            whatsappDriverNotify(DriverDetails.full_name,booking_details.pickup_location,booking_details.pickup_date,booking_details.pickup_time,customerDetails.firstName+" "+customerDetails.lastName,customerDetails.phoneNumber,DriverDetails.phone_number)


            res.status(httpStatusCodes[200].code)
                .json(formResponse(httpStatusCodes[200].code, {
                    "message":"Driver informed successfully for pickup",
                    pickUp
                }))
            return;
        
        }
        catch (error) {
            console.log(error)
           return res.status(httpStatusCodes[500].code).json(formResponse(httpStatusCodes[500].code, error))
        }
    }

}


exports.updatedropoff = async (req, res) => {
    if (Object.keys(req.body).length === 0) {
        return res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, "Body is empty"))
    }
    const { error, value } = updatePickDropSchema.validate(req.body);

    if (error) {

        res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, error))
    }
    else {
        try {
            const cancelledBooking = await Booking.findOne({
                where: {
                    _id: req.params.id,
                    booking_status: 'cancelled'
                }
            })

            if (cancelledBooking) {
                return res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, `Booking for this dropoff is already cancelled`))
            }

            DropCustomer.update(
                req.body,
                { where: { booking_id: req.params.id, isDeleted: false } }
            )
                .then(result => {
                    if (result[0]) {
                        res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code, `DropOff for booking:${req.params.id} updated successfully ${result}`))
                    }
                    else {
                        res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, `No Bookings are available for BookingID: ${req.params.id}`))
                    }
                }
                )
                .catch(err =>
                    res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, err))
                )
        } catch (error) {
            res.status(httpStatusCodes[500].code).json(formResponse(httpStatusCodes[500].code, error))
        }
    }
}

exports.dropoff = async (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
        return res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, "Body is empty"))
    }
    const { error, value } = pickUpDropOffSchema.validate(req.body);

    if (error) {
        res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, error))
    }
    else {
        try {
            const DriverDetails = await Driver.findOne({
                where: {
                    id: req.body.driverId,
                    isDeleted: false,
                    isAvailable:true
                }
            })

            if(!DriverDetails){
                res.status(httpStatusCodes[400].code)
                .json(formResponse(httpStatusCodes[400].code,  "Please provide valid Driver ID"))
            return;
            }
            const booking_details = await Booking.findOne({
                where: {
                    _id: req.body.booking_id,
                    booking_status: "pending"
                },
                attributes: ["_id","customer_id","pickup_date","pickup_time","pickup_location","dropoff_date","dropoff_time","dropoff_location"]
            })

            if (!booking_details) {
                return res.status(httpStatusCodes[400].code)
                    .json(formResponse(httpStatusCodes[400].code, "Booking ID is InValid"))
            }
            const customerDetails = await Customer.findOne({
                attributes: ["firstName","lastName","email", "phoneNumber"],
                where: {
                    _id: booking_details.dataValues.customer_id,
                    isDeleted: false
                }
            })

            if (!DriverDetails || !customerDetails) {
                res.status(httpStatusCodes[400].code)
                    .json(formResponse(httpStatusCodes[400].code, "Please provide valid customer and driver ID"))
                return;
            }

            const dropoff = await DropCustomer.create(
                {
                    booking_id: req.body.booking_id,
                    // vehicle_id: req.body.vehicle_id,
                    driver: req.body.driverId,
                    vehicle_condition: req.body.vehicle_condition,
                    fuel_km:req.body.fuel_km,
                    fuel_tank:req.body.fuel_tank
                }
            )

            const driverAvabilityUpdation=await Driver.update({
                isAvailable:false
            },{
                where:{
                    id:req.body.driverId
                   }
            })


            let customerEmail=`
                Hello ${customerDetails.firstName+" "+customerDetails.lastName}

                Your Drop Off Details
                Booking ID : ${req.body.booking_id}
                DropOff location : ${booking_details.dropoff_location}
                DropOff Date :  ${booking_details.dropoff_date}
                DropOff time :  ${booking_details.dropoff_time}

                Driver :  ${DriverDetails.full_name} 
                Driver phone number :  ${DriverDetails.phone_number}
            `

            let driverEmail=`
            Hello ${DriverDetails.full_name} 

            You having a Drop Off 
            location : ${booking_details.dropoff_location}
            date : ${booking_details.dropoff_date}
            time: ${booking_details.dropoff_time}

            Customer Name :  ${customerDetails.firstName+" "+customerDetails.lastName}
            Customer Phone number : ${customerDetails.phoneNumber}
            `
            const CustomerEmailError = await emailNotify(customerDetails.email, 'Drop Off registration done successfully',customerEmail);

            whatsappDropCustomerNotify(customerDetails.firstName+" "+customerDetails.lastName,req.body.booking_id,booking_details.dropoff_location,booking_details.dropoff_date,booking_details.dropoff_time,DriverDetails.full_name,DriverDetails.phone_number,customerDetails.phoneNumber)

            const DriverEmailError = await emailNotify(DriverDetails.email,"", driverEmail);
            
            whatsappDriverNotify(DriverDetails.full_name,booking_details.dropoff_location,booking_details.dropoff_date,booking_details.dropoff_time,customerDetails.firstName+" "+customerDetails.lastName,customerDetails.phoneNumber,DriverDetails.phone_number)

            return res.status(httpStatusCodes[200].code)
                .json(formResponse(httpStatusCodes[200].code, {
                    "message":"Driver informed successfully for dropoff",
                    dropoff
                }))
           
            // }
        }
        catch (error) {
            console.log(error)
            return res.status(httpStatusCodes[500].code).json(formResponse(httpStatusCodes[500].code, error))
        }
    }
}



exports.bookingCancellation = async (req, res) => {

    const { error, value } = bookingCancellationSchema.validate({
        booking_id: req.params.id
    });

    if (error) {
        return res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, error))
    }

    try {
        const bookingCancellation = await Booking.update({
            booking_status: "cancelled"
        }, {
            where: {
                _id: req.params.id,
                booking_status: "pending"
            }
        })
        if (bookingCancellation[0]) {
            return res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code, "Booking Cancelled successfully"))
        }
        else {
            return res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, "Booking Cancellation unSuccessfull"))
        }
    } catch (error) {
        return res.status(httpStatusCodes[500].code).json(formResponse(httpStatusCodes[500].code, error))
    }


}

const getBookingById=async(booking_id,customer_id,vehicle_id)=>{
  
    let result={

    }

    let additional_pickupDriver=[

    ]

    let additional_dropoffDriver=[
        
    ]
    try {
       
        const customer_details =  Customer.findOne({
                        attributes: ["firstName","lastName","phoneNumber"],
                        isDeleted: false,
                        where: {
                            _id: customer_id,
            
            
                        }
                    })
        const vehicle_details= Vehicle.findOne({
            attributes: ["id","type","owner","rental_price","make"],
            isDeleted: false,
            where: {
                id: vehicle_id,
            }
        })

        const res=await Promise.all([customer_details,vehicle_details])

        const pickup_details = PickCustomer.findOne({
                        attributes: ["_id","driver"],
                        where: {
                            booking_id: booking_id,
                            isDeleted: false
                        },
            
                    })
        const dropoff_details = DropCustomer.findOne({
                        attributes: ["_id","driver"],
                        where: {
                            booking_id: booking_id,
                            isDeleted: false
                        }
                    })

      const pick_drop_details=await Promise.all([pickup_details,dropoff_details])
        // const additionalDropOffDriverDetails =await db.query(`SELECT * FROM drivers WHERE drivers.id IN(SELECT dropoffdriversbookings.driver_id FROM bookings,dropoffdriversbookings WHERE bookings._id="${booking_id}");`)
       

        // const additionalPickUpDriverDetails =await db.query(`SELECT * FROM drivers WHERE drivers.id IN(SELECT pickupdriversbookings.driver_id FROM bookings,pickupdriversbookings WHERE bookings._id="${booking_id}");`)
        if(pick_drop_details[0] && pick_drop_details[1]){
            const pickupDriverID=pick_drop_details[0].dataValues.driver;
            const dropoffDriverID=pick_drop_details[1].dataValues.driver;

            const pickup_id=pick_drop_details[0].dataValues._id
            const dropoff_id=pick_drop_details[1].dataValues._id

        
            const pickup_additional_driver=await pickupDriversBooking.findAll({
                where:{
                    pickup_id:pickup_id
                },
                attributes:["driver_id"]
            })
          

            if(pickup_additional_driver){
                for(let i=0;i<pickup_additional_driver.length;i++){
                    const DriverDetails=await Driver.findOne({
                        where:{
                            id:pickup_additional_driver[i].dataValues.driver_id
                        },
                        attributes:["id","full_name"]
                    })
                    additional_pickupDriver=[
                        ...additional_pickupDriver,
                        DriverDetails
                    ]

                }
            }

            const dropoff_additional_driver=await dropoffDriversBooking.findAll({
                where:{
                    dropoff_id:dropoff_id
                },
                attributes:["driver_id"]
            })

          
            if(dropoff_additional_driver){
                for(let i=0;i<dropoff_additional_driver.length;i++){
                    const DriverDetails=await Driver.findOne({
                        where:{
                            id:dropoff_additional_driver[i].dataValues.driver_id
                        },
                        attributes:["id","full_name"]
                    })
                    additional_dropoffDriver=[
                        ...additional_dropoffDriver,
                        DriverDetails
                    ]

                }
            }




            const pickupDriverDetails= Driver.findOne({
                where:{
                    id:pickupDriverID
                },
                attributes:["id","full_name"]
            })

            const dropoffDriverDetails= Driver.findOne({
                where:{
                    id:dropoffDriverID,
                },
                attributes:["id","full_name"]
            })

            const pick_drop_driver=await Promise.all([pickupDriverDetails,dropoffDriverDetails])
            result={
                // "bookingDetails":bookingDetails,
                "customer_details":res[0],
                "vehicle_details":res[1],
                // "vendorDetails":vendorDetails,
                "pickup_details":pick_drop_details[0],
                "dropoff_details":pick_drop_details[1],
                "pickup_driver":pick_drop_driver[0],
                "dropoff_driver":pick_drop_driver[1],
                "additionalDropOffDriverDetails":additional_dropoffDriver,
                "additionalPickUpDriverDetails":additional_pickupDriver
            }
            return result;
        }
        else{
            result={
                // "bookingDetails":bookingDetails,
                "customer_details":res[0],
                "vehicle_details":res[1],
                // "vendorDetails":vendorDetails,
                
                "pickup_details":{
                },
                "dropoff_details":{
                },
                // "additionalDropOffDriverDetails":{
                //     ...additionalDropOffDriverDetails[0]
                // },
                // "additionalPickUpDriverDetails":{
                //     ...additionalPickUpDriverDetails[0]
                // }
            }
            return result;
        }
       
    } catch (error) {
        console.log(error)
        return 0
    }
}

exports.getBooking = async (req, res)=>{
    const bookingDetail=await Booking.findOne({
        where:{
            _id: req.params.id,
            isDeleted:false
        },
        attributes:["_id","customer_id","vehicle_id","pickup_date","pickup_time","dropoff_date","dropoff_time","pickup_location","dropoff_location","duration","total_rent","deposit_amount","per_day_rent"],
    })

    
    let bookingDetails=bookingDetail.dataValues
    
    if(bookingDetails){
        let result= await getBookingById(bookingDetails._id,bookingDetails.customer_id,bookingDetails.vehicle_id);
        if(result){
           result={
            bookingDetails,
            ...result
           }
            return res.status(httpStatusCodes[200].code)
            .json(formResponse(httpStatusCodes[200].code, result))
        }
        else{
            return res.status(httpStatusCodes[500].code)
            .json(formResponse(httpStatusCodes[500].code))
        }

    }else{
        return res.status(httpStatusCodes[400].code)
        .json(formResponse(httpStatusCodes[400].code,`No Booking is available for bookingID ${req.params.id}`))
    }

}

exports.getAllBooking=async(req,res)=>{
    let skip=5*(req.query.page);
    let result=[]
    try {
        const allBookingID=await Booking.findAll({ 
            attributes:["_id","customer_id","vehicle_id","pickup_date","pickup_time","dropoff_date","dropoff_time","pickup_location","dropoff_location","duration","total_rent","deposit_amount","per_day_rent"],
            limit:10,
            offset:skip
        })
    let i=0;
    let max_length=allBookingID.length
    

    for(let j=0;j<max_length;j++){
      
     let bookingDetails= allBookingID[j]
     let bookingAdditonalDetails=await getBookingById(allBookingID[j].dataValues._id,allBookingID[j].dataValues.customer_id,allBookingID[j].dataValues.vehicle_id)

     bookingAdditonalDetails={
        bookingDetails,
        ...bookingAdditonalDetails
       
     }
    result=[
        ...result,
        bookingAdditonalDetails
    ]

    }
    return res.status(httpStatusCodes[200].code)
    .json(formResponse(httpStatusCodes[200].code,result))
           
    } catch (error) {
        console.log(error)
        return res.status(httpStatusCodes[500].code)
        .json(formResponse(httpStatusCodes[500].code,error))
    } 

    
}
