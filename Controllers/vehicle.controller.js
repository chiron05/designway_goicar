const Vehicle = require('../Models/Vehicle')
const Vendor =require('../Models/Vendor')


exports.createVehicle= async(req,res)=>{
    try{
    const vehicle= await Vehicle.create(req.body)
    res.status(200).send(vehicle)
    }
    catch(err)
    {
        res.status(500).send(err)
    }
}

exports.getAllVehicle = async (req, res) => {

    const vehicles=await Vehicle.findAll({
        
       include:{
        model:Vendor
       }
    })
    try {
        res.status(200).send(vehicles)

    }
    catch (error) {
        res.status(500).send(error)
    }
}

exports.updateVehicle = async (req, res) => {
    try {
        await Vehicle.update(req.body,{
        where:{
            id:req.params.id
        }
    })
  
        res.status(200).send(`Vehicle ${req.params.id} updated`)

    }
    catch (error) {
        res.status(500).send(error)
    }
}
exports.deleteVehicle = async (req, res) => {
   try{
        await Vehicle.destroy({
        where:{
            id:req.params.id
        }
    })
    res.status(200).send(`Vehicle ${req.params.id} deleted`)
   }
    catch (error) {
        res.status(500).send(error)
    }
}
