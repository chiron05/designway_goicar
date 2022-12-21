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
                attributes: ["_id"]
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

            if (data.errors) {
                res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, data.error))
            }
            else {
                res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code, data))
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
                    isDeleted: false
                }
            })

            const booking_details = await Booking.findOne({
                where: {
                    _id: req.body.booking_id,
                    booking_status: "pending"
                },
                attributes: ["customer_id"]
            })

            if (!booking_details) {
                return res.status(httpStatusCodes[404].code)
                    .json(formResponse(httpStatusCodes[404].code, "Booking ID is InValid"))
            }
            const customerDetails = await Customer.findOne({
                attributes: ["email", "phoneNumber"],
                where: {
                    _id: booking_details.dataValues.customer_id,
                    isDeleted: false
                }
            })

            if (!DriverDetails || !customerDetails) {

                res.status(httpStatusCodes[404].code)
                    .json(formResponse(httpStatusCodes[404].code, "No records Found"))
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
                    id: req.body.driverId, isDeleted: false
                }
            })
            const booking_details = await Booking.findOne({
                where: {
                    _id: req.body.booking_id,
                    booking_status: "pending"
                },
                attributes: ["customer_id"]
            })

            if (!booking_details) {
                return res.status(httpStatusCodes[404].code)
                    .json(formResponse(httpStatusCodes[404].code, "Booking ID is InValid"))
            }
            const customerDetails = await Customer.findOne({
                attributes: ["email", "phoneNumber"],
                where: {
                    _id: booking_details.dataValues.customer_id,
                    isDeleted: false
                }
            })

            if (!DriverDetails || !customerDetails) {
                res.status(httpStatusCodes[404].code)
                    .json(formResponse(httpStatusCodes[404].code, "No records Found"))
                return;
            }

            const dropoff = await DropCustomer.create(
                {
                    booking_id: req.body.booking_id,
                    vehicle_id: req.body.vehicle_id,
                    driver: req.body.driverId,
                    contact_num: req.body.contact_num,
                    vehicle_condition: req.body.vehicle_condition
                }
            )

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
            return;
            // }
        }
        catch (error) {
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

exports.getBooking = async (req, res) => {
    // console.log(req.params.id)
    try {
        const booking_details = await Booking.findOne({
            where: {
                _id: req.params.id,

            }
        })
        const customer_details = await Customer.findOne({
            attributes: ["firstName", "lastName", "email", "phoneNumber"],
            isDeleted: false,
            where: {
                _id: booking_details.dataValues.customer_id,


            }
        })

        const pickup_details = await PickCustomer.findOne({
            // include: [{ model: Driver }],
            attributes: ["driver", "contact_num", "vehicle_condition"],
            where: {
                booking_id: req.params.id,
                isDeleted: false
            },

        })
        const driver_details_pickup = await Driver.findOne({

            where: {
                id: pickup_details.dataValues.driver
            }
        })

        const dropoff_details = await DropCustomer.findOne({
            attributes: ["driver", "contact_num", "vehicle_condition"],
            where: {
                booking_id: req.params.id,
                isDeleted: false
            }
        })

        const driver_details_dropoff = await Driver.findOne({

            where: {
                id: dropoff_details.dataValues.driver
            }
        })

        let bookingdata = {

            bookingDetails: {
                customer_id: booking_details.customer_id,
                vehicle_id: booking_details.vehicle_id,
                pickup_date: booking_details.pickup_date,
                pickup_time: booking_details.pickup_time,
                dropoff_date: booking_details.dropoff_date,
                dropoff_time: booking_details.dropoff_time,
                vehicle_type: booking_details.vehicle_type,
                pickup_location: booking_details.pickup_location,
                dropoff_location: booking_details.dropoff_location,
                duration: booking_details.duration,
                booking_status: booking_details.booking_status

            },
            customer_details: {
                firstName: customer_details.firstName,
                lastName: customer_details.lastName,
                email: customer_details.email,
                phoneNumber: customer_details.phoneNumber
            },

            pickup_details: {
                driverName: driver_details_pickup.full_name,
                driverContact: pickup_details.contact_num,
                vehicle_condition: pickup_details.vehicle_condition,
                video: pickup_details.video
            },
            dropoff_details: {
                driverName: driver_details_dropoff.full_name,
                driverContact: dropoff_details.contact_num,
                vehicle_condition: dropoff_details.vehicle_condition,
                video: dropoff_details.video
            }

        }
        return res.status(httpStatusCodes[200].code)
            .json(formResponse(httpStatusCodes[200].code, bookingdata))


    }
    catch (err) {
        return res.status(httpStatusCodes[500].code).json(formResponse(httpStatusCodes[500].code, err))
    }
}

exports.getAllBooking = async (req, res) => {
    await Booking.findAll().then(result => {
        res.status(httpStatusCodes[200].code)
            .json(formResponse(httpStatusCodes[200].code, result))
    }).catch(err => {
        res.status(httpStatusCodes[404].code)
            .json(formResponse(httpStatusCodes[404].code, err))
    })
}
