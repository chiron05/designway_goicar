const Joi=require("joi");
const { joiPasswordExtendCore } = require('joi-password');
const joiPassword = Joi.extend(joiPasswordExtendCore);



const createaddonbooking=Joi.object({
    booking_id:Joi.string().required(),
    Insurance:Joi.number(),
    zero_liability:Joi.number(),
    pick_charges:Joi.number(),
    drop_charges:Joi.number(),
    owh_pickup:Joi.number(),
    owh_dropoff:Joi.number(),
    fuel:Joi.number(),
    tank:Joi.string(),
    os_rental:Joi.number(),
    os_tax:Joi.number(),
    discount:Joi.number(),
    comments:Joi.string()
});

const updateaddonbooking=Joi.object({
    booking_id:Joi.string().required(),
    Insurance:Joi.number(),
    zero_liability:Joi.number(),
    pick_charges:Joi.number(),
    drop_charges:Joi.number(),
    owh_pickup:Joi.number(),
    owh_dropoff:Joi.number(),
    fuel:Joi.number(),
    tank:Joi.string(),
    os_rental:Joi.number(),
    os_tax:Joi.number(),
    discount:Joi.number(),
    comments:Joi.string()
});

module.exports={
    createaddonbooking,
    updateaddonbooking
}