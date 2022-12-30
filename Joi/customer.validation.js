const Joi=require("joi");
const { joiPasswordExtendCore } = require('joi-password');


const createCustomerSchema=Joi.object({
    firstName:Joi.string().required(),
    lastName:Joi.string().required(),
    email:Joi.string().email({
        minDomainSegments:2,
        tlds:{allow:["com","in"]}
    }).required(),
    validUntil:Joi.date(),
    alternate_number:Joi.string(),
    idNumber:Joi.number().required(),
    phoneNumber:Joi.string().length(12).pattern(/^[0-9]+$/).required(),
    idProofURL:Joi.string().required()
}
)

const updateCustomer=Joi.object({
    _id:Joi.string().min(36).required(),
    firstName:Joi.string(),
    lastName:Joi.string(),
    alternate_number:Joi.string(),
    validUntil:Joi.date(),
    idNumber:Joi.number(),
    email:Joi.string().email({
        minDomainSegments:2,
        tlds:{allow:["com","in"]}
    }),
    phoneNumber:Joi.string().length(12).pattern(/^[0-9]+$/)
}
)

const deleteCustomer=Joi.object({
    _id:Joi.string().min(36).required(),
}
)
 
 

module.exports={
    createCustomerSchema,
    updateCustomer,
    deleteCustomer
}