const Joi=require("joi");
const { joiPasswordExtendCore } = require('joi-password');
const joiPassword = Joi.extend(joiPasswordExtendCore);

const authSchema=Joi.object({
    role:Joi.string(),
    name:Joi.string().min(6).max(12),
    first_name:Joi.string().min(2).max(20),
    last_name:Joi.string().min(2).max(20),
    password:joiPassword.string().min(3).required(),
    phone_number:Joi.string().length(12).pattern(/^[0-9]+$/),
    id_proof:Joi.string(),
    email:Joi.string().email({
        minDomainSegments:2,
        tlds:{allow:["com","in"]}
    }).required()
});


const authPhoneSchema=Joi.object({
    role:Joi.string(),
    name:Joi.string().min(6).max(12),
    first_name:Joi.string().min(2).max(20),
    last_name:Joi.string().min(2).max(20),
    password:joiPassword.string().min(3).required(),
    phone_number:Joi.string().length(12).pattern(/^[0-9]+$/).required(),
    id_proof:Joi.string(),
    email:Joi.string().email({
        minDomainSegments:2,
        tlds:{allow:["com","in"]}
    })
});


module.exports={
    authPhoneSchema,
    authSchema
}
