const Joi=require("joi");
const { joiPasswordExtendCore } = require('joi-password');

const genrateInvoiceSchema=Joi.object({
    booking_id:Joi.string().min(36).required(),
    total_rent:Joi.number(),
    pickup_fee:Joi.number(),
    dropoff_fee:Joi.number(),
    fuel:Joi.number(),
    insurance:Joi.number(),
    zero_liability:Joi.number(),
    tax:Joi.number(),
    gst:Joi.number(),
    deposit:Joi.number(),
    total:Joi.number()
}
)

module.exports={
    genrateInvoiceSchema
}