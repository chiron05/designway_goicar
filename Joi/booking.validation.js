const Joi=require("joi");
const { joiPasswordExtendCore } = require('joi-password');
const joiPassword = Joi.extend(joiPasswordExtendCore);

const confirmBookingSchema=Joi.object({
   bookingid:Joi.string().min(36)
});

const updateBookingSchema=Joi.object({
   _id:Joi.string().min(36),
   vehicle_id:Joi.string().min(36),
   pickup_date:Joi.date(),
   pickup_time:Joi.string(),
   dropoff_time:Joi.string(),
   customer_id:Joi.string().min(36),
   dropoff_date:Joi.date(),
   pickup_location:Joi.string(),
   dropoff_location:Joi.string(),
   duration:Joi.string(),
   booking_status:Joi.string(),
   bookingid:Joi.string().min(36),
   total_rent:Joi.number(),
   deposit_amount:Joi.number(),
   per_day_rent:Joi.number(),
   pick_up_address:Joi.string(),
   drop_off_address:Joi.string()
});

const createBookingSchema=Joi.object({
   customer_id:Joi.string().min(36),
   vehicle_id:Joi.string().min(36),
   pickup_date:Joi.date(),
   pickup_time:Joi.string(),
   dropoff_time:Joi.string(),
   dropoff_date:Joi.date(),
   pickup_location:Joi.string(),
   dropoff_location:Joi.string(),
   duration:Joi.string(),
   total_rent:Joi.number(),
   deposit_amount:Joi.number(),
   per_day_rent:Joi.number(),
   pick_up_address:Joi.string(),
   drop_off_address:Joi.string()
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
   vehicle_condition:Joi.string(),
   fuel_km:Joi.number(),
   fuel_tank:Joi.number()
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
