const Joi=require("joi");
const { joiPasswordExtendCore } = require('joi-password');
const joiPassword = Joi.extend(joiPasswordExtendCore);

const authSchema=Joi.object({
    role:Joi.string(),
    name:Joi.string().min(6).max(12),
    full_name:Joi.string().min(3).max(20),
    password:joiPassword.string().minOfSpecialCharacters(1).minOfLowercase(2).minOfUppercase(1).minOfNumeric(2).noWhiteSpaces().required(),
    phone_number:Joi.string().length(12).pattern(/^[0-9]+$/),
    id_proof:Joi.string(),
    email:Joi.string().email({
        minDomainSegments:2,
        tlds:{allow:["com","in"]}
    }).required()
});

module.exports=authSchema
