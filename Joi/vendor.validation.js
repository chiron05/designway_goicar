const Joi = require("joi");
const { joiPasswordExtendCore } = require('joi-password');


const createVendorSchema = Joi.object({
    // id: Joi.string().min(36).required(),
    first_name: Joi.string().min(2).max(20).required(),
    last_name: Joi.string().min(2).max(20),
    address: Joi.string().required(),
    city_state: Joi.string().min(1),
    pincode: Joi.string().min(3),
    email: Joi.string().email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "in"] }
    }),
    phone_number: Joi.string().length(12).pattern(/^[0-9]+$/).required(),
    alternate_number: Joi.string().length(12).pattern(/^[0-9]+$/),
    id_proof: Joi.string().required(),
    id_no: Joi.string().required(),
    address_line1: Joi.string(),
    billing_city_state: Joi.string(),
    billing_pincode: Joi.string(),
    beneficiary_name: Joi.string(),
    bank_name: Joi.string(),
    NEFT_ISC_CODE: Joi.string(),
    ACCOUNT_NO: Joi.string(),
    ACCOUNT_TYPE: Joi.string()
}
)

const getVendorByIdSchema=Joi.object({
    id: Joi.string().min(36).required()
})

const updateVendorSchema = Joi.object(
    {
        first_name: Joi.string().min(2).max(20),
        last_name: Joi.string().min(2).max(20),
        address: Joi.string(),
        city_state: Joi.string().min(1),
        pincode: Joi.string().min(3),
        email: Joi.string().email({
            minDomainSegments: 2,
            tlds: { allow: ["com", "in"] }
        }),
        phone_number: Joi.string().length(12).pattern(/^[0-9]+$/),
        alternate_number: Joi.string().length(12).pattern(/^[0-9]+$/),
        id_proof: Joi.string(),
        id_no: Joi.string(),
        address_line1: Joi.string(),
        billing_city_state: Joi.string(),
        billing_pincode: Joi.string(),
        beneficiary_name: Joi.string(),
        bank_name: Joi.string(),
        NEFT_ISC_CODE: Joi.string(),
        ACCOUNT_NO: Joi.string(),
        ACCOUNT_TYPE: Joi.string()

    }
)
const deleteVendor = Joi.object({
    id: Joi.string().min(36).required(),
}
)

module.exports = {
    createVendorSchema,
    updateVendorSchema,
    deleteVendor,
    getVendorByIdSchema
}