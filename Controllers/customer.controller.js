const httpStatusCodes = require('../Constants/http-status-codes');
const { createCustomerSchema, updateCustomer, deleteCustomer } = require('../Joi/customer.validation');
const Customer = require('../Models/customer.model');
const cloudinary = require('../Utils/cloudinary');
const { formResponse } = require('../Utils/helper');


exports.deleteCustomer = async (req, res, next) => {

    const { error, value } = deleteCustomer.validate({
        _id: req.params.id
    });
    if (error) {
        return res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, error))
        return
    } else {
        const customerDeatails = await Customer.findOne(
            {
                attributes: ["isDeleted"],
                where: {
                    _id: req.params.id,
                    isDeleted: false
                }
            })
        if (customerDeatails) {
            if (customerDeatails.dataValues.isDeleted) {
                return res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, `No Customer available for CustomerID: ${req.params.id}`))
            }

            Customer.update({
                isDeleted: true
            }, {
                where: {
                    _id: req.params.id,
                    isDeleted: false
                }
            }).then(result => {

                console.log(result)
                if (result) {
                    res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code, `Customer Deleted successfully`))
                }
                else {
                    res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, `No Customer available for CustomerID: ${req.params.id}`))
                }
            }).catch(err => {
                res.status(httpStatusCodes[404].code)
                    .json(formResponse(httpStatusCodes[400].code, err))
            })
        }
        else {
            res.status(httpStatusCodes[400].code)
                .json(formResponse(httpStatusCodes[400].code, err))
        }

    }
}



exports.updateCustomer = async (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
        return res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, "Body is empty"))
    }
    const { error, value } = updateCustomer.validate({
        _id: req.params.id,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
    });
    if (error) {
        res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, error))
        return
    }
    else {
        Customer.update(
            req.body,
            { where: { _id: req.params.id, isDeleted: false } }
        )
            .then(result => {
                if (result[0]) {
                    res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code, `Customer Updated successfully`))
                }
                else {
                    res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, `No Customer available for CustomerID: ${req.params.id}`))
                }
            }
            )
            .catch(err =>
                res.status(httpStatusCodes[400].code)
                    .json(formResponse(httpStatusCodes[400].code, err))
            )
    }
}

exports.getCustomer = async (req, res) => {
    let skip = 10 * (req.query.page);
    Customer.findAll({
        attributes: ["_id", "firstName", "lastName", "email", "phoneNumber", "idProofURL", "alternate_number"],
        limit: 10,
        offset: skip,
        where: {
            isDeleted: false
        }
    }).then(result => {
        res.status(httpStatusCodes[200].code)
            .json(formResponse(httpStatusCodes[200].code, result))
    }).catch(err => {
        res.status(httpStatusCodes[404].code)
            .json(formResponse(httpStatusCodes[404].code, err))
    })
}

exports.createCustomer = async (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
        return res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, "Body is empty"))
    }
    if (req.body.phoneNumber == req.body.alternate_number) {
        res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, `Alternate phonenumber must be different`))
        return;
    }
    try {
        const result = await cloudinary.uploader.upload(req.file.path);
        const { error, value } = createCustomerSchema.validate({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            alternate_number: req.body.alternate_number,
            validUntil: req.body.validUntil,
            idNumber: req.body.idNumber,
            phoneNumber: req.body.phoneNumber,
            idProofURL: result.url
        });
        if (error) {
            res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, error))
            return
        }

        const existingCustomer = await Customer.findOne({
            attributes: ["email"],
            where: {
                email: req.body.email,
                isDeleted: true
            }
        })
        if (existingCustomer) {
            const customerDelete = await Customer.destroy({
                where: {
                    email: req.body.email
                }
            })
        }

        let data = Customer.build({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            alternate_number: req.body.alternate_number,
            validUntil: req.body.validUntil,
            idNumber: req.body.idNumber,
            phoneNumber: req.body.phoneNumber,
            idProofURL: result.url
        })

        await data.save();

        if (data.errors) {
            res.status(httpStatusCodes[400].code)
                .json(formResponse(httpStatusCodes[400].code, data.errors))
        }
        else {
            res.status(httpStatusCodes[200].code)
                .json(formResponse(httpStatusCodes[200].code, {
                    "message": "Customer created successfully",
                    data
                }))
        }


    } catch (error) {
        console.log(error)
        res.status(httpStatusCodes[400].code)
            .json(formResponse(httpStatusCodes[400].code, error))

    }


}

exports.getCustomerByPhone = async (req, res) => {
    Customer.findOne({
        attributes: ["_id", "firstName", "lastName", "email", "phoneNumber", "idProofURL", "alternate_number"],
        where: {
            phoneNumber: req.params.no,
            isDeleted: false
        }
    }).then(result => {

        if (result) {
            return res.status(httpStatusCodes[200].code)
                .json(formResponse(httpStatusCodes[200].code, result))
        } else {
            return res.status(httpStatusCodes[404].code)
                .json(formResponse(httpStatusCodes[404].code, "No Customer available"))
        }

    }).catch(err => {
        res.status(httpStatusCodes[404].code)
            .json(formResponse(httpStatusCodes[404].code, err))
    })
}



exports.getCustomerById = async (req, res) => {
    Customer.findOne({
        attributes: ["_id", "firstName", "lastName", "email", "phoneNumber", "idProofURL", "alternate_number"],
        where: {
            _id: req.params.id,
            isDeleted: false
        }
    }).then(result => {

        if (result) {
            return res.status(httpStatusCodes[200].code)
                .json(formResponse(httpStatusCodes[200].code, result))
        } else {
            return res.status(httpStatusCodes[404].code)
                .json(formResponse(httpStatusCodes[404].code, "No Customer available"))
        }

    }).catch(err => {
        res.status(httpStatusCodes[500].code)
            .json(formResponse(httpStatusCodes[500].code, err))
    })
}


exports.getCustomerByName = async (req, res) => {
    console.log(req.body)
    Customer.findAll({
        attributes: ["_id", "firstName", "lastName", "email", "phoneNumber", "idProofURL", "alternate_number"],
        where: {
            firstName: req.body.firstName,
        }
    }).then(result => {

        if (result) {
            return res.status(httpStatusCodes[200].code)
                .json(formResponse(httpStatusCodes[200].code, result))
        } else {
            return res.status(httpStatusCodes[404].code)
                .json(formResponse(httpStatusCodes[404].code, "No Customer available"))
        }

    }).catch(err => {
        res.status(httpStatusCodes[500].code)
            .json(formResponse(httpStatusCodes[500].code, err))
    })
}
