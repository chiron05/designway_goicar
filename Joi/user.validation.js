const Joi=require("joi");
const { joiPasswordExtendCore } = require('joi-password');


const createUserSchema=Joi.object({
    role:Joi.string().required(),
    full_name:Joi.string().required(),
    email:Joi.string().email({
        minDomainSegments:2,
        tlds:{allow:["com","in"]}
    }).required(),
    phoneNumber:Joi.string().length(12).pattern(/^[0-9]+$/).required(),
    password:Joi.string().min(3).max(15).required(),
    idProofURL:Joi.string().required()
}
)

const updateUserSchema=Joi.object({
    id:Joi.string().min(36).required(),
    role:Joi.string(),
    full_name:Joi.string(),
    email:Joi.string().email({
        minDomainSegments:2,
        tlds:{allow:["com","in"]}
    }),
    phoneNumber:Joi.string().length(12).pattern(/^[0-9]+$/),
    password:Joi.string().min(3).max(15),
    idProofURL:Joi.string()
}
)

const deleteUserSchema=Joi.object({
    id:Joi.string().min(36).required(),
}
)

module.exports={
    createUserSchema,
    updateUserSchema,
    deleteUserSchema
}