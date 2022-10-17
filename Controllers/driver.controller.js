const httpStatusCodes = require('../Constants/http-status-codes');
const { formResponse } = require('../Utils/helper');
const PickCustomer=require('../Models/pickCustomer.model')
const DropCustomer = require('../Models/dropCustomer.model')

const Driver = require('../Models/Driver.js')
const cloudinary = require('../Utils/cloudinary')

exports.getDrivers = async (req, res) => {


    await Driver.findAll().then(result => {
        res.status(httpStatusCodes[200].code)
            .json(formResponse(httpStatusCodes[200].code, result))
    }).catch(err => {
        res.status(httpStatusCodes[404].code)
            .json(formResponse(httpStatusCodes[404].code, err))
    })


}
exports.createDriver = async (req, res) => {
    try {
        const result = await cloudinary.uploader.upload(req.file.path, {
            resource_type: "auto"
        })

        const driver = Driver.build({
            full_name: req.body.full_name,
            phone_number: req.body.phone_number,
            alternate_number: req.body.alternate_number,
            email: req.body.email,
            license_no: req.body.license_no,
            license_img: result.url
        })

        await driver.save()

        if (driver.errors) {
            res.status(httpStatusCodes[404].code)
                .json(formResponse(httpStatusCodes[404].code, driver.errors))
        }
        else {
            res.status(httpStatusCodes[200].code)
                .json(formResponse(httpStatusCodes[200].code, driver))
        }

    }
    catch (err) {
        res.status(httpStatusCodes[404].code)
            .json(formResponse(httpStatusCodes[404].code, err))
    }
}
exports.updateDriver = async (req, res) => {

    try {
        await Driver.update(req.body, {
            where: {
                id: req.params.id
            }
        })
            .then(result => {
                if (result[0]) {
                    res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code, `driver ${req.params.id} updated successfully ${result}`))
                }
                else {
                    res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, `No driver are available for driver_ID: ${req.params.id}`))
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

exports.deleteDriver = async (req, res) => {
    try {
        await Driver.destroy({
            where: {
                id: req.params.id
            }
        })
        .then(result => {
            if (result) {
                res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code, `driver ${req.params.id} deleted successfully ${result}`))
            }
            else {
                res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, `No driver are available for driver_ID: ${req.params.id}`))
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



exports.getRideDetails=async(req,res)=>{

    const pickup=req.body.pickup
    if(pickup == 'true')
    {
        let booking=await PickCustomer.findAll({
            attributes:['booking_id'],
            where:{
                driver:req.params.id
            }
        })
        res.status(200).send({
            "pickup":booking
        })
    }
    else
    {
        let booking=await DropCustomer.findAll({
            attributes:['booking_id'],
            where:{
                driver:req.params.id
            }
        })
        res.status(200).send({
            "Dropoff":booking
        })
    }
}

