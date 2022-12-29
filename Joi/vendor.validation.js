const Joi = require("joi");
const { joiPasswordExtendCore } = require('joi-password');


const createVendorSchema = Joi.object({
    // id: Joi.string().min(36).required(),
    full_name: Joi.string().min(6).max(20).required(),
    address: Joi.string().required(),
    city: Joi.string().min(1).required(),
    state: Joi.string().min(3).required(),
    pincode: Joi.string().min(3).required(),
    email: Joi.string().email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "in"] }
    }),
    phone_number: Joi.string().length(12).pattern(/^[0-9]+$/).required(),
    alternate_number: Joi.string().length(12).pattern(/^[0-9]+$/).required(),
    id_proof: Joi.string().required(),
    id_no: Joi.string().required()

}
)

const getVendorByIdSchema=Joi.object({
    id: Joi.string().min(36).required()
})

const updateVendorSchema = Joi.object(
    {

        full_name: Joi.string().min(6).max(20),
        address: Joi.string(),
        city: Joi.string().min(1),
        state: Joi.string().min(3),
        pincode: Joi.string().min(3),
        email: Joi.string().email({
            minDomainSegments: 2,
            tlds: { allow: ["com", "in"] }
        }),
        phone_number: Joi.string().length(12).pattern(/^[0-9]+$/),
        alternate_number: Joi.string().length(12).pattern(/^[0-9]+$/),
        id_proof: Joi.string(),
        id_no: Joi.string()

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