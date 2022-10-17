const Vendor = require('../Models/Vendor.js')
const Vehicle =require('../Models/Vehicle')


exports.getVendors = async (req, res) => {
    try {
        const vendors=await Vendor.findAll({
            include:{
                model:Vehicle,
              
            }
            
        })
        res.status(200).send(vendors)

    }
    catch (error) {
        res.status(500).send(error)
    }

}

exports.createVendor = async (req, res) => {
    try {
        const vendor = await Vendor.create(req.body)
        res.status(200).send(vendor)
    }
    catch (err) {
        res.status(500).send(err)
    }
}
exports.updateVendor = async (req, res) => {

    try {
        await Vendor.update(req.body,{
        where:{
           id:req.params.id
        }
    })
        res.status(200).send(`Vendor ${req.params.id} updated`)

    }
    catch (error) {
        res.status(500).send(error)
    }

}
exports.deleteVendors = async (req, res) => {
    try {
        await Vendor.destroy({
        where:{
            id:req.params.id
        }
    })
        res.status(200).send(`Vendor ${req.params.id} deleted`)

    }
    catch (error) {
        res.status(500).send(error)
    }
}

