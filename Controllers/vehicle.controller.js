const Vehicle = require('../Models/Vehicle')
const Vendor = require('../Models/Vendor')
const vehicleImages = require('../Models/vehicleImages.model');
const httpStatusCodes = require('../Constants/http-status-codes');
const { formResponse } = require('../Utils/helper');

const { updateVehicleSchema, createVehicleSchema, deleteVehicle } = require('../Joi/vehicle.validation');
const { model } = require('mongoose');

exports.getVehicleById = async (req, res) => {
    const vehicle_details = await Vehicle.findOne({
        include: [{ model: Vendor }],
        where: {
            id: req.params.id,
            isDeleted: false
        }
    })
        .then(result => {
            if (result != null) {
                res.status(httpStatusCodes[200].code)
                    .json(formResponse(httpStatusCodes[200].code, result))
            }
            else {
                res.status(httpStatusCodes[404].code)
                    .json(formResponse(httpStatusCodes[404].code, err))
            }
        }).catch(err => {
            res.status(httpStatusCodes[500].code)
                .json(formResponse(httpStatusCodes[500].code, err))
        })
}
exports.createVehicle = async (req, res) => {
    var data = req.body
    if (Object.keys(data).length === 0) {
        res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, `Provide body`))
        return
    }

    const vendorDetails=await Vendor.findOne({
        where:{
            id:req.body.owner
        }
    })

    if(!vendorDetails){
        return  res.status(httpStatusCodes[404].code)
        .json(formResponse(httpStatusCodes[404].code, "Owner/Vendor ID is invalid"))
    }

    try {

        const { error, value } = createVehicleSchema.validate({
            number: req.body.number,
            make: req.body.make,
            type: req.body.type,
            transmission: req.body.transmission,
            class: req.body.class,
            registration_no: req.body.registration_no,
            colour: req.body.colour,
            image: req.body.image,
            owner: req.body.owner,
            on_goicar_since: req.body.on_goicar_since,
            rc_Book: req.body.rc_Book,
            pollution_certificate: req.body.pollution_certificate,
            insurance: req.body.insurance,
            RSA: req.body.RSA,
            rental_price:req.body.rental_price,
            Hub:req.body.Hub
        });
        if (error) {

            res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, error))

            return
        }

        const existingVehicle = await Vehicle.findOne({
            where: {
                registration_no: req.body.registration_no,
                isDeleted: true
            }
        })

        if (existingVehicle) {
            await Vehicle.destroy({
                where: {
                    registration_no: req.body.registration_no
                }
            })
        }

        const vehicle = Vehicle.build({
            number: req.body.number,
            make: req.body.make,
            type: req.body.type,
            transmission: req.body.transmission,
            class: req.body.class,
            registration_no: req.body.registration_no,
            colour: req.body.colour,
            image: req.body.image,
            owner: req.body.owner,
            on_goicar_since: req.body.on_goicar_since,
            rc_Book: req.body.rc_Book,
            pollution_certificate: req.body.pollution_certificate,
            insurance: req.body.insurance,
            RSA: req.body.RSA,
            rental_price:req.body.rental_price,
            Hub:req.body.Hub

        })

        await vehicle.save()

        if (vehicle.errors) {
          return  res.status(httpStatusCodes[404].code)
                .json(formResponse(httpStatusCodes[404].code, vehicle.errors))
        }
        else {
          return  res.status(httpStatusCodes[200].code)
                .json(formResponse(httpStatusCodes[200].code, {
                    "message":"Vehicle created successfully",
                    vehicle
                }))
        }

    }
    catch (err) {
        console.log(err)
        res.status(httpStatusCodes[404].code)
            .json(formResponse(httpStatusCodes[404].code, err))
    }
}

exports.getAllVehicle = async (req, res) => {
    let skip=10*(req.query.page);
    await Vehicle.findAll({
        include: [{ model: Vendor }],
        where:{
            isDeleted:false
        },
        limit:10,
        offset:skip
    }).then(result => {
        res.status(httpStatusCodes[200].code)
            .json(formResponse(httpStatusCodes[200].code, result))
    }).catch(err => {
        res.status(httpStatusCodes[404].code)
            .json(formResponse(httpStatusCodes[404].code, err))
    })
}

exports.updateVehicle = async (req, res) => {
    var data = req.body
    if (Object.keys(data).length === 0) {
        res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code))
        return
    }
    const { error, value } = updateVehicleSchema.validate(req.body);
    if (error) {

        res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, error))
        return
    }



    try {
        await Vehicle.update(req.body, {
            where: {
                id: req.params.id,
                isDeleted: false
            }
        })
            .then(result => {
                if (result[0]) {
                    res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code, `vehicle ${req.params.id} updated successfully`))
                }
                else {
                    res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, `No Vehicle are available for VehicleID: ${req.params.id}`))
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
exports.deleteVehicle = async (req, res) => {

    const { error, value } = deleteVehicle.validate({
        id: req.params.id
    });
    if (error) {
        res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, error))
        return
    }
    {
        const VehiDeatails = await Vehicle.findOne(
            {
                // attributes: ["isDeleted"],
                where: {
                    id: req.params.id
                }
            })
        if (VehiDeatails) {
            if (VehiDeatails.isDeleted) {
                return res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, `No Vehicles for VehicleID: ${req.params.id}`))
            }


            Vehicle.update({
                isDeleted: true
            }, {
                where: {
                    id: req.params.id
                }
            }).then(result => {

                console.log(result)
                if (result) {
                    res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code, `Vehicle Deleted successfully`))
                }
                else {
                    res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, `No Vehicle available for vehicle Id: ${req.params.id}`))
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
