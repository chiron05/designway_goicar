const Vendor = require('../Models/Vendor.js')
const Vehicle = require('../Models/Vehicle')
const httpStatusCodes = require('../Constants/http-status-codes');
const { formResponse } = require('../Utils/helper');
const { Sequelize } = require("sequelize")
const cloudinary = require('../Utils/cloudinary');

const { createVendorSchema, updateVendorSchema, deleteVendor, getVendorByIdSchema } = require('../Joi/vendor.validation');
const { object } = require('joi/lib/index.js');

const { uploadToS3 } = require('../Utils/digitalOceanConfig')

exports.getVendors = async (req, res) => {
    let skip = 10 * (req.query.page);
    await Vendor.findAll({
        where: {
            isDeleted: false
        },
        limit: 10,
        offset: skip
    }).then(result => {
        res.status(httpStatusCodes[200].code)
            .json(formResponse(httpStatusCodes[200].code, result))
    }).catch(err => {
        res.status(httpStatusCodes[404].code)
            .json(formResponse(httpStatusCodes[404].code, err))
    })
}

exports.createVendor = async (req, res) => {
   
    if(req.body.ACCOUNT_NO){
        if(req.body.ACCOUNT_NO!=req.body.RE_ENTER_ACCOUNT_NO){
            return res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code,"RE-ENTER account number is different"))
        }
    }
    const id_proofLink = await uploadToS3(req.file, 'vendor_Id')
    const ipObj = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        address: req.body.address,
        city_state: req.body.city_state,
        pincode: req.body.pincode,
        email: req.body.email,
        phone_number: req.body.phone_number,
        alternate_number: req.body.alternate_number,
        id_proof: id_proofLink.Location,
        id_no: req.body.id_no,
        address_line1: req.body.address_line1,
        billing_city_state: req.body.billing_city_state,
        billing_pincode: req.body.billing_pincode,
        beneficiary_name: req.body.beneficiary_name,
        bank_name: req.body.bank_name,
        NEFT_ISC_CODE: req.body.NEFT_ISC_CODE,
        ACCOUNT_NO: req.body.ACCOUNT_NO,
        ACCOUNT_TYPE: req.body.ACCOUNT_TYPE

    }

    if (Object.keys(ipObj).length === 0) {
        return res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, "Provide Body"))
    }
    try {
        const { error, value } = createVendorSchema.validate(ipObj);
        if (error) {
            return res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, error))
        }

        const existingVendor = await Vendor.findOne({
            where: Sequelize.and(
                {
                    isDeleted: true
                }, Sequelize.or(
                    { email: req.body.email },
                    { phone_number: req.body.phone_number }
                )
            )
        })


        if (existingVendor) {
            const updateExistingVendor = await Vendor.update({
                isDeleted: false
            }, {
                where: Sequelize.and(
                    {
                        isDeleted: true
                    }, Sequelize.or(
                        { email: req.body.email },
                        { phone_number: req.body.phone_number }
                    )
                )
            })

            return res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code, {
                "message": "Vendor's Account Reactivated"
            }))
        }

      

        const vendor = await Vendor.create(ipObj)
        return res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code, {
            "message": "Vendor created successfully",
            vendor
        }))
    }
    catch (error) {
        console.log(error)
        return res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, error))
    }


}

exports.getVendorById = async (req, res) => {


    const { error, value } = getVendorByIdSchema.validate({ id: req.params.id });
    if (error) {

        return res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, error))

    }

    const vendorDetails = await Vendor.findOne({
        where: {
            id: req.params.id,
            isDeleted: false
        }
    })

    if (vendorDetails) {
        return res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code, vendorDetails))
    } else {
        return res.status(httpStatusCodes[404].code).json(formResponse(httpStatusCodes[404].code, "Invalid Vendor ID"))
    }
}




exports.updateVendor = async (req, res) => {

    // if (req.body) {
    //     res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, "Enter data"))

    // }

    var data = req.body
    if (Object.keys(data).length === 0) {
        res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code))
        return
    }
    const { error, value } = updateVendorSchema.validate(req.body);
    if (error) {

        res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, error))
        return
    }



    try {
        await Vendor.update(req.body, {
            where: {
                id: req.params.id,
                isDeleted: false
            }
        })
            .then(result => {
                if (result[0]) {
                    res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code, `vendor ${req.params.id} updated successfully`))
                }
                else {
                    res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, `No Vendor are available for VendorID: ${req.params.id}`))
                }
            }
            )
            .catch(err =>

                res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, err))
            )
    }
    catch (error) {
        res.status(httpStatusCodes[500].code).json(formResponse(httpStatusCodes[500].code, error))
    }

}
exports.deleteVendors = async (req, res) => {

    const { error, value } = deleteVendor.validate({
        id: req.params.id
    });
    if (error) {
        res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, error))
        return
    }
    {
        const VendorDeatails = await Vendor.findOne(
            {
                where: {
                    id: req.params.id
                }
            })
        if (VendorDeatails) {
            if (VendorDeatails.isDeleted) {
                return res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, `No Vendor available for VendorID: ${req.params.id}`))
            }


            Vendor.update({
                isDeleted: true
            }, {
                where: {
                    id: req.params.id
                }
            }).then(result => {

                console.log(result)
                if (result) {
                    res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code, `Vendor Deleted successfully`))
                }
                else {
                    res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, `No Vendor available for vendorID: ${req.params.id}`))
                }
            }).catch(err => {
                res.status(httpStatusCodes[404].code)
                    .json(formResponse(httpStatusCodes[404].code, err))
            })
        }
        else {

            res.status(httpStatusCodes[404].code)
                .json(formResponse(httpStatusCodes[404].code, err))


        }

    }

}



exports.getVendorByPhone = async (req, res) => {

    Vendor.findOne({
        where: {
            phone_number: req.params.no,
        }
    }).then(result => {

        if (result) {
            return res.status(httpStatusCodes[200].code)
                .json(formResponse(httpStatusCodes[200].code, result))
        } else {
            return res.status(httpStatusCodes[404].code)
                .json(formResponse(httpStatusCodes[404].code, "No Vendor available"))
        }

    }).catch(err => {
        res.status(httpStatusCodes[500].code)
            .json(formResponse(httpStatusCodes[500].code, err))
    })
}


exports.getVendorByName = async (req, res) => {
    console.log(req.body)
    Vendor.findAll({
        where: {
            first_name: req.body.first_name,
            last_name:req.body.last_name,
            isDeleted: false
        }
    }).then(result => {

        if (result[0]) {
            return res.status(httpStatusCodes[200].code)
                .json(formResponse(httpStatusCodes[200].code, result))
        } else {
            return res.status(httpStatusCodes[404].code)
                .json(formResponse(httpStatusCodes[404].code, "No Vendor available"))
        }

    }).catch(err => {
        res.status(httpStatusCodes[500].code)
            .json(formResponse(httpStatusCodes[500].code, err))
    })
}
