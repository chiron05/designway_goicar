const httpStatusCodes = require('../Constants/http-status-codes');
const { createCustomerSchema, updateCustomer, deleteCustomer } = require('../Joi/customer.validation');
const Customer = require('../Models/customer.model');
const cloudinary = require('../Utils/cloudinary');
const { uploadToS3 } = require('../Utils/digitalOceanConfig');
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
        driver_license_number:req.body.driver_license_number,
        alternate_number:req.body.alternate_number,
        idNumber:req.body.idNumber,
        validUntil:req.body.validUntil,
        driver_license_number:req.body.driver_license_number
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
        attributes: ["_id", "firstName", "lastName", "email", "phoneNumber", "idProof", "alternate_number","validUntil","id_front","id_back","driving_license","idNumber","driver_license_number"],
        limit: 10,
        offset: skip,
        where: {
            isDeleted: false
        },
        order: [['createdAt', 'DESC']]
    }).then(result => {
        res.status(httpStatusCodes[200].code)
            .json(formResponse(httpStatusCodes[200].code, result))
    }).catch(err => {
        res.status(httpStatusCodes[404].code)
            .json(formResponse(httpStatusCodes[404].code, err))
    })
}

exports.createCustomer = async (req, res, next) => {

//   const new_customer=await Customer.findOne({
//     attributes:['_id'],
//     where:{
//         alternate_number:req.body.alternate_number,
//         isDeleted:false
//     }
//   })

//   if(!new_customer){
//     res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, `Alternate number already exist`))
//     return;
//   }

        if (Object.keys(req.body).length === 0) {
            return res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, "Body is empty"))
        }
        if (req.body.phoneNumber == req.body.alternate_number) {
            res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, `Alternate phonenumber must be different`))
            return;
        }
        try {
            // console.log(req.files.id_front[0])
            let customerDocuments={

            }
            if(req.files.id_front!=undefined){
                const id_front = await uploadToS3(req.files.id_front[0], 'id_front')
                customerDocuments["id_front"]=id_front.Location
            }
            if(req.files.id_back!=undefined){
                const id_back = await uploadToS3(req.files.id_back[0], 'id_back')
                customerDocuments["id_back"]=id_back.Location
            }
            if(req.files.driving_license!=undefined){
                const driving_license = await uploadToS3(req.files.driving_license[0], 'driving_license')
                customerDocuments["driving_license"]=driving_license.Location
            }
         
          
          

            const { error, value } = createCustomerSchema.validate({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                alternate_number: req.body.alternate_number,
                validUntil: req.body.validUntil,
                idNumber: req.body.idNumber,
                phoneNumber: req.body.phoneNumber,
                idProof: req.body.idProof,
                driver_license_number:req.body.driver_license_number,
                ...customerDocuments
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
                idProof: req.body.idProof,
                driver_license_number:req.body.driver_license_number,
               ...customerDocuments
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
        attributes: ["_id", "firstName", "lastName", "email", "phoneNumber","driver_license_number", "idProof", "alternate_number","validUntil","id_front","id_back","driving_license","idNumber"],

        where: {
            phoneNumber: req.params.no,
            isDeleted: false
        },
        order: [['createdAt', 'DESC']]
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
        attributes: ["_id", "firstName", "lastName", "email","driver_license_number", "phoneNumber", "idProof", "alternate_number","validUntil","id_front","id_back","driving_license","idNumber"],
        order: [['createdAt', 'DESC']],
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
        attributes: ["_id", "firstName", "lastName", "email","driver_license_number", "phoneNumber", "idProof", "alternate_number","validUntil","id_front","id_back","driving_license","idNumber"],

        where: {
            firstName: req.query.firstName,
            lastName:req.query.lastName
        },
        order: [['createdAt', 'DESC']]
    }).then(result => {

        if (result.length!=0) {
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
