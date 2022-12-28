const Joi = require("joi");
const { joiPasswordExtendCore } = require('joi-password');

const createDriverSchema = Joi.object({
    full_name: Joi.string().min(4).max(50).required(),
    phone_number: Joi.string().length(12).pattern(/^[0-9]+$/).required(),
    alternate_number: Joi.string().length(12).pattern(/^[0-9]+$/).required(),
    email: Joi.string().email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "in"] }
    }).required(),
    license_no: Joi.string().required(),
    license_img: Joi.string().required()
}
)

const updateDriverSchema = Joi.object({
    full_name: Joi.string().alphanum().min(6).max(50),
    phone_number: Joi.string().length(12).pattern(/^[0-9]+$/),
    alternate_number: Joi.string().length(12).pattern(/^[0-9]+$/),
    email: Joi.string().email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "in"] }
    }).required(),
    license_no: Joi.string(),
}
)

const deleteDriverSchema = Joi.object({
    id: Joi.string().min(36).required()
})

const getRideDetailsSchema = Joi.object({
    id: Joi.string().min(36).required(),
    pickup: Joi.string().valid('true', 'false').required()
})

const driverUpload = Joi.object({
    booking_id: Joi.string().min(36).required(),
    pickup: Joi.string().valid('true', 'false').required()
})

const getDriverById=Joi.object({
    id: Joi.string().min(36).required()
})

module.exports = {
    createDriverSchema,
    updateDriverSchema,
    deleteDriverSchema,
    getRideDetailsSchema,
    driverUpload,
    getDriverById
}