const Joi=require("joi");
const { joiPasswordExtendCore } = require('joi-password');
const joiPassword = Joi.extend(joiPasswordExtendCore);

const confirmBookingSchema=Joi.object({
   bookingid:Joi.string().min(36)
});

const updateBookingSchema=Joi.object({
   _id:Joi.string().min(36).required(),
   vehicle_id:Joi.string().min(36),
   pickup_date:Joi.date(),
   dropoff_date:Joi.date(),
   pickup_location:Joi.string(),
   dropoff_location:Joi.string(),
   duration:Joi.string(),
   booking_status:Joi.string(),
   bookingid:Joi.string().min(36),
   total_rent:Joi.number(),
   deposit_amount:Joi.number(),
   per_day_rent:Joi.number()
});

const createBookingSchema=Joi.object({
   customer_id:Joi.string().min(36),
   vehicle_id:Joi.string().min(36),
   pickup_date:Joi.date(),
   dropoff_date:Joi.date(),
   pickup_location:Joi.string(),
   dropoff_location:Joi.string(),
   duration:Joi.string(),
   total_rent:Joi.number(),
   deposit_amount:Joi.number(),
   per_day_rent:Joi.number()
});

const updatePickDropSchema=Joi.object({
   _id:Joi.string().min(36),
   booking_id:Joi.string().min(36),
   driver:Joi.string().min(36),
   searchBookingId:Joi.string().min(36),
   fuel_km:Joi.number(),
   fuel_tank:Joi.number()
});

const pickUpDropOffSchema=Joi.object({
   booking_id:Joi.string().min(36),
   driverId:Joi.string().min(36),
   contact_num:Joi.string().length(12).pattern(/^[0-9]+$/),
   vehicle_condition:Joi.string(),
   fuel_km:Joi.number().required(),
   fuel_tank:Joi.number().required()
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
