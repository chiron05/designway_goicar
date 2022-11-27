const Joi=require("joi");
const { joiPasswordExtendCore } = require('joi-password');
const joiPassword = Joi.extend(joiPasswordExtendCore);

const confirmBookingSchema=Joi.object({
   bookingid:Joi.string().min(36)
});

const updateBookingSchema=Joi.object({
   _id:Joi.string().min(36).required(),
   vehicle_id:Joi.string(),
   pickup_date:Joi.date(),
   dropoff_date:Joi.date(),
   vehicle_type:Joi.string(),
   pickup_location:Joi.string(),
   dropoff_location:Joi.string(),
   duration:Joi.string(),
   booking_status:Joi.string(),
   bookingid:Joi.string().min(36)
});

const createBookingSchema=Joi.object({
   vehicle_id:Joi.string(),
   pickup_date:Joi.date(),
   dropoff_date:Joi.date(),
   vehicle_type:Joi.string(),
   pickup_location:Joi.string(),
   dropoff_location:Joi.string(),
   duration:Joi.string(),
});

const updatePickDropSchema=Joi.object({
   _id:Joi.string().min(36),
   booking_id:Joi.string().min(36),
   driver:Joi.string().min(36),
   searchBookingId:Joi.string().min(36),
});

const pickUpDropOffSchema=Joi.object({
   booking_id:Joi.string().min(36),
   driverId:Joi.string().min(36),
   contact_num:Joi.string().length(12).pattern(/^[0-9]+$/),
   vehicle_condition:Joi.string()
})

const bookingCancellationSchema=Joi.object({
   booking_id:Joi.string().min(36)
})


module.exports={
   confirmBookingSchema,
   updateBookingSchema,
   createBookingSchema,
   updatePickDropSchema,
   pickUpDropOffSchema,
   bookingCancellationSchema
}
