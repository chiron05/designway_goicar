const path = require('path')
const Booking = require('../Models/booking.model')
const PickCustomer = require('../Models/pickCustomer.model')
const DropCustomer = require('../Models/dropCustomer.model')
const Customer = require('../Models/customer.model')
const cloudinary = require('../Utils/cloudinary')
const Driver = require('../Models/Driver')
const { emailNotify } = require('../services/email')
const { whatsappNotify } = require('../services/whatsapp')
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
            vehicle_type: req.body.vehicle_type,
            pickup_location: req.body.pickup_location,
            dropoff_location: req.body.dropoff_location,
            duration: req.body.duration
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
                vehicle_type: req.body.vehicle_type,
                pickup_location: req.body.pickup_location,
                dropoff_location: req.body.dropoff_location,
                duration: req.body.duration
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
               
                emailNotify(customer.email,"subject",`Hello ${customer.firstName}
                You have received a link from Goicar. Here is your booking link <thelink> please click on the link to update your booking details. Click here: http://localhost:3000/track/${req.body.customer_id}/${data._id}`)

                res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code, {
                    "Message":"Booking done successfully"
                }))
            }
        } catch (error) {
            console.log(error)
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
                attributes: ["customer_id"]
            })

            if (!booking_details) {
                return res.status(httpStatusCodes[400].code)
                    .json(formResponse(httpStatusCodes[400].code, "Booking ID is InValid"))
            }
            const customerDetails = await Customer.findOne({
                attributes: ["email", "phoneNumber"],
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
                    // vehicle_id: req.body.vehicle_id,
                    driver: req.body.driverId,
                    contact_num: req.body.contact_num,
                    vehicle_condition: req.body.vehicle_condition
                }
            )
            
            const driverAvabilityUpdation=await Driver.update({
                isAvailable:false
            },{
               where:{
                id:req.body.driverId
               }
            })

            const CustomerEmailError = await emailNotify(customerDetails.email, 'subject', 'having this ride');
            const CustomerWhatAppError = await whatsappNotify('having this ride', customerDetails.phoneNumber);
            const DriverEmailError = await emailNotify(DriverDetails.email, 'subject', 'having this ride');
            const DriverWhatAppError = await whatsappNotify('having this ride', DriverDetails.phone_number);
            // if(CustomerEmailError || CustomerWhatAppError||DriverEmailError||DriverWhatAppError){
            //     res.status(httpStatusCodes[404].code)
            //     .json(formResponse(httpStatusCodes[404].code, {
            //         "DriverEmailError":DriverEmailError,
            //         "DriverWhatsAppError":DriverWhatAppError,
            //         "CustomerEmailError":CustomerEmailError,
            //         "CustomerWhatAppError":CustomerWhatAppError
            //     }))
            //     return;
            // }
            // else{
            res.status(httpStatusCodes[200].code)
                .json(formResponse(httpStatusCodes[200].code, "Driver informed successfully for pickup"))
            return;
            // }
        }
        catch (error) {
            console.log(error)
            res.status(httpStatusCodes[500].code).json(formResponse(httpStatusCodes[500].code, error))
        }
    }

}


exports.updatedropoff = async (req, res) => {
    if (Object.keys(req.body).length === 0) {
        return res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, "Body is empty"))
    }
    const { error, value } = pickUpDropOffSchema.validate(req.body);

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
                attributes: ["customer_id"]
            })

            if (!booking_details) {
                return res.status(httpStatusCodes[400].code)
                    .json(formResponse(httpStatusCodes[400].code, "Booking ID is InValid"))
            }
            const customerDetails = await Customer.findOne({
                attributes: ["email", "phoneNumber"],
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
                    contact_num: req.body.contact_num,
                    vehicle_condition: req.body.vehicle_condition
                }
            )

            const driverAvabilityUpdation=await Driver.update({
                isAvailable:false
            },{
                where:{
                    id:req.body.driverId
                   }
            })


            const CustomerEmailError = await emailNotify(customerDetails.email, 'subject', 'yo having this ride');
            const CustomerWhatAppError = await whatsappNotify('kyaa bhaiii', customerDetails.phoneNumber);
            const DriverEmailError = await emailNotify(DriverDetails.email, 'subject', 'yo having this ride');
            const DriverWhatAppError = await whatsappNotify('kyaa bhaiii', DriverDetails.phone_number);
            // if(CustomerEmailError || CustomerWhatAppError||DriverEmailError||DriverWhatAppError){
            //     res.status(httpStatusCodes[404].code)
            //     .json(formResponse(httpStatusCodes[404].code, {
            //         "DriverEmailError":DriverEmailError,
            //         "DriverWhatsAppError":DriverWhatAppError,
            //         "CustomerEmailError":CustomerEmailError,
            //         "CustomerWhatAppError":CustomerWhatAppError
            //     }))
            //     return;
            // }
            // else{
            return res.status(httpStatusCodes[200].code)
                .json(formResponse(httpStatusCodes[200].code, "Driver informed successfully for dropoff"))
           
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

const getBookingById=async(booking_id)=>{
  
    let result={

    }

    let additional_pickupDriver=[

    ]

    let additional_dropoffDriver=[
        
    ]
    try {
        const bookingDetails=await Booking.findOne({
            where:{
                _id: booking_id,
                isDeleted:false
            }
        })
       
        const customer_details = await Customer.findOne({
                        attributes: ["firstName", "lastName", "email", "phoneNumber"],
                        isDeleted: false,
                        where: {
                            _id: bookingDetails.dataValues.customer_id,
            
            
                        }
                    })

        const vehicle_details=await Vehicle.findOne({
            attributes: ["id", "number", "make", "type","transmission","class","registration_no","colour","image","owner","on_goicar_since","rc_Book","pollution_certificate","insurance","RSA"],
            isDeleted: false,
            where: {
                id: bookingDetails.dataValues.vehicle_id,
            }
        })
     

        const vendorDetails=await Vendor.findOne({
            attributes: ["id", "full_name","address","city","state","pincode","email","phone_number","alternate_number","id_proof","id_no"],
            isDeleted: false,
            where: {
                id: vehicle_details.dataValues.owner,
            }
        })
       
        const pickup_details = await PickCustomer.findOne({
                        attributes: ["_id","driver", "contact_num", "vehicle_condition"],
                        where: {
                            booking_id: booking_id,
                            isDeleted: false
                        },
            
                    })
        const dropoff_details = await DropCustomer.findOne({
                        attributes: ["_id","driver", "contact_num", "vehicle_condition"],
                        where: {
                            booking_id: booking_id,
                            isDeleted: false
                        }
                    })

      
        // const additionalDropOffDriverDetails =await db.query(`SELECT * FROM drivers WHERE drivers.id IN(SELECT dropoffdriversbookings.driver_id FROM bookings,dropoffdriversbookings WHERE bookings._id="${booking_id}");`)
       

        // const additionalPickUpDriverDetails =await db.query(`SELECT * FROM drivers WHERE drivers.id IN(SELECT pickupdriversbookings.driver_id FROM bookings,pickupdriversbookings WHERE bookings._id="${booking_id}");`)
        if(pickup_details && dropoff_details){
            const pickupDriverID=pickup_details.driver;
            const dropoffDriverID=pickup_details.driver;

            const pickup_id=pickup_details._id
            const dropoff_id=dropoff_details._id

            console.log("pick"+pickup_id)
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
                        attributes:["id","full_name","phone_number","alternate_number","email","license_no","license_img","isAvailable"]
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
                        attributes:["id","full_name","phone_number","alternate_number","email","license_no","license_img","isAvailable"]
                    })
                    additional_dropoffDriver=[
                        ...additional_dropoffDriver,
                        DriverDetails
                    ]

                }
            }




            const pickupDriverDetails=await Driver.findOne({
                where:{
                    id:pickupDriverID
                }
            })

            const dropoffDriverDetails=await Driver.findOne({
                where:{
                    id:dropoffDriverID
                }
            })
            result={
                "bookingDetails":{
                    _id:bookingDetails._id,
                    customer_id: bookingDetails.customer_id,
                    vehicle_id: bookingDetails.vehicle_id,
                    pickup_date: bookingDetails.pickup_date,
                    pickup_time: bookingDetails.pickup_time,
                    dropoff_date: bookingDetails.dropoff_date,
                    dropoff_time: bookingDetails.dropoff_time,
                    vehicle_type: bookingDetails.vehicle_type,
                    pickup_location: bookingDetails.pickup_location,
                    dropoff_location: bookingDetails.dropoff_location,
                    duration: bookingDetails.duration,
                    booking_status: bookingDetails.booking_status
                },
                "customer_details":{
                    firstName:customer_details.firstName,
                    lastName:customer_details.lastName,
                    email:customer_details.email,
                    phoneNumber:customer_details.phoneNumber
                },
                "vehicle_details":{
                    id:vehicle_details.id,
                    number:vehicle_details.number,
                    make:vehicle_details.make,
                    type:vehicle_details.type,
                    transmission:vehicle_details.transmission,
                    registration_no:vehicle_details.registration_no,
                    colour:vehicle_details.colour,
                    image:vehicle_details.image,
                    owner:vehicle_details.owner,
                    on_goicar_since:vehicle_details.on_goicar_since,
                    rc_Book:vehicle_details.rc_Book,
                    pollution_certificate:vehicle_details.pollution_certificate,
                    insurance:vehicle_details.insurance,
                    RSA:vehicle_details.RSA
                },
                "vendorDetails":{
                    id:vendorDetails.id,
                    full_name:vendorDetails.full_name,
                    address:vendorDetails.address,
                    city:vendorDetails.city,
                    state:vendorDetails.state,
                    pincode:vendorDetails.pincode,
                    email:vehicle_details.email,
                    phone_number:vendorDetails.phone_number,
                    alternate_number:vendorDetails.alternate_number,
                    id_proof:vendorDetails.id_proof,
                    id_no:vendorDetails.id_no
                }
                ,
                "pickup_details":{
                        driver:pickup_details.driver,
                        contact_num:pickup_details.contact_num,
                        vehicle_condition:pickup_details.vehicle_condition
                },
                "dropoff_details":{
                    driver:dropoff_details.driver,
                    contact_num:dropoff_details.contact_num,
                    vehicle_condition:dropoff_details.vehicle_condition
                },
                "pickup_driver":{
                    id:pickupDriverDetails.id,
                    full_name:pickupDriverDetails.full_name,
                    phone_number:pickupDriverDetails.phone_number,
                    alternate_number:pickupDriverDetails.alternate_number,
                    email:pickupDriverDetails.email,
                    license_no:pickupDriverDetails.license_no,
                    license_img:pickupDriverDetails.license_img,
                },
                "dropoff_driver":{
                    id:dropoffDriverDetails.id,
                    full_name:dropoffDriverDetails.full_name,
                    phone_number:dropoffDriverDetails.phone_number,
                    alternate_number:dropoffDriverDetails.alternate_number,
                    email:dropoffDriverDetails.email,
                    license_no:dropoffDriverDetails.license_no,
                    license_img:dropoffDriverDetails.license_img,
                },
                "additionalDropOffDriverDetails":additional_dropoffDriver,
                "additionalPickUpDriverDetails":additional_pickupDriver
            }
            return result;
        }
        else{
            result={
                "bookingDetails":{
                    _id:bookingDetails._id,
                    customer_id: bookingDetails.customer_id,
                    vehicle_id: bookingDetails.vehicle_id,
                    pickup_date: bookingDetails.pickup_date,
                    pickup_time: bookingDetails.pickup_time,
                    dropoff_date: bookingDetails.dropoff_date,
                    dropoff_time: bookingDetails.dropoff_time,
                    vehicle_type: bookingDetails.vehicle_type,
                    pickup_location: bookingDetails.pickup_location,
                    dropoff_location: bookingDetails.dropoff_location,
                    duration: bookingDetails.duration,
                    booking_status: bookingDetails.booking_status
                },
                "customer_details":{
                    firstName:customer_details.firstName,
                    lastName:customer_details.lastName,
                    email:customer_details.email,
                    phoneNumber:customer_details.phoneNumber
                },
                "vehicle_details":{
                    id:vehicle_details.id,
                    number:vehicle_details.number,
                    make:vehicle_details.make,
                    type:vehicle_details.type,
                    transmission:vehicle_details.transmission,
                    registration_no:vehicle_details.registration_no,
                    colour:vehicle_details.colour,
                    image:vehicle_details.image,
                    owner:vehicle_details.owner,
                    on_goicar_since:vehicle_details.on_goicar_since,
                    rc_Book:vehicle_details.rc_Book,
                    pollution_certificate:vehicle_details.pollution_certificate,
                    insurance:vehicle_details.insurance,
                    RSA:vehicle_details.RSA
                },
                "vendorDetails":{
                    id:vendorDetails.id,
                    full_name:vendorDetails.full_name,
                    address:vendorDetails.address,
                    city:vendorDetails.city,
                    state:vendorDetails.state,
                    pincode:vendorDetails.pincode,
                    email:vehicle_details.email,
                    phone_number:vendorDetails.phone_number,
                    alternate_number:vendorDetails.alternate_number,
                    id_proof:vendorDetails.id_proof,
                    id_no:vendorDetails.id_no
                }
                ,
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
    const bookingDetails=await Booking.findOne({
        where:{
            _id: req.params.id,
            isDeleted:false
        }
    })
    if(bookingDetails){
        const result= await getBookingById(req.params.id);
        if(result){
           
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
            attributes:["_id"],
            limit:10,
            offset:skip
        })
    let i=0;
    let max_length=allBookingID.length
   
    for(let j=0;j<max_length;j++){
        console.log(allBookingID[j].dataValues._id)
     const booking=await getBookingById(allBookingID[j].dataValues._id)
     result=[
      booking,
        ...result
     ]
    }
    return res.status(httpStatusCodes[200].code)
    .json(formResponse(httpStatusCodes[200].code,result))
           
    } catch (error) {
        return res.status(httpStatusCodes[500].code)
        .json(formResponse(httpStatusCodes[500].code,error))
    } 

    
}
