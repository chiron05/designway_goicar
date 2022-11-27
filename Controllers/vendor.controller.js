const Vendor = require('../Models/Vendor.js')
const Vehicle = require('../Models/Vehicle')
const httpStatusCodes = require('../Constants/http-status-codes');
const { formResponse } = require('../Utils/helper');
const cloudinary = require('../Utils/cloudinary');

const { createVendorSchema, updateVendorSchema, deleteVendor } = require('../Joi/vendor.validation');
const { object } = require('joi/lib/index.js');


exports.getVendors = async (req, res) => {
    await Vendor.findAll().then(result => {
        res.status(httpStatusCodes[200].code)
            .json(formResponse(httpStatusCodes[200].code, result))
    }).catch(err => {
        res.status(httpStatusCodes[404].code)
            .json(formResponse(httpStatusCodes[404].code, err))
    })
}

exports.createVendor = async (req, res) => {
    // try {
    //     const vendor = await Vendor.create(req.body)
    //     res.status(200).send(vendor)
    // }
    // catch (err) {
    //     res.status(500).send(err)
    // }
    if(Object.keys(req.body).length === 0){
        return  res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code,"Provide Body"))    
    }
    try {
        const {error,value}=createVendorSchema.validate(req.body);
        if(error){
           return res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code,error))      
        }

        const existingVendor=await Vendor.findOne({ 
            where:Sequelize.and(
                {
                    isDeleted:true
                },Sequelize.or(                   
                        {email:req.body.email},
                        {phone_number:req.body.phone_number}
                )                          
        )
        })
    
       
       if(existingVendor){
            const updateExistingVendor=await Vendor.update({
                isDeleted:false
            },{
                where:Sequelize.and(
                    {
                        isDeleted:true
                    },Sequelize.or(                   
                            {email:req.body.email},
                            {phone_number:req.body.phone_number}
                    )
                )
            })

            return  res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code,{
                "message":"Vendor's Account Reactivated"
            }))    
       }

        const vendor = await Vendor.create(req.body)
        return  res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code, vendor))
    }
    catch (error) {
        return  res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, error))
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
                // attributes: ["isDeleted"],
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
