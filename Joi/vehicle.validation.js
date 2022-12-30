const Joi = require("joi");
const { joiPasswordExtendCore } = require('joi-password');

const createVehicleSchema = Joi.object({
    // id: Joi.string().min(36).required(),
    number: Joi.string().required(),
    make: Joi.string().required(),
    type: Joi.string().required(),
    transmission: Joi.string().required(),
    class: Joi.string().required(),
    registration_no: Joi.string().required(),
    colour: Joi.string().required(),
    image: Joi.string().required(),
    owner: Joi.string().required(),
    on_goicar_since: Joi.string().required(),
    rc_Book: Joi.string().required(),
    pollution_certificate: Joi.string().required(),
    insurance: Joi.string().required(),
    RSA: Joi.string().required(),
    rental_price: Joi.number().required(),
    Hub: Joi.string().required(),
}
)
const updateVehicleSchema = Joi.object(
    {
        number: Joi.string(),
        make: Joi.string(),
        type: Joi.string(),
        transmission: Joi.string(),
        class: Joi.string(),
        registration_no: Joi.string(),
        colour: Joi.string(),
        image: Joi.string(),
        owner: Joi.string(),
        on_goicar_since: Joi.string(),
        rc_Book: Joi.string(),
        pollution_certificate: Joi.string(),
        insurance: Joi.string(),
        RSA: Joi.string(),
        rental_price: Joi.number(),
        Hub: Joi.string(),

    }
)

const deleteVehicle = Joi.object({
    id: Joi.string().min(36).required(),
}
)

module.exports = {
    deleteVehicle,
    createVehicleSchema,
    updateVehicleSchema
}