const PickCustomer = require("../../Models/pickCustomer.model")



exports.getpickupvideo=async(req,res)=>{
    try{
        let pick_video= await PickCustomer.findAll({
           where:{
            booking_id:req.params.booking_id
           }
        })
        res.status(200).send(pick_video)

    }
    catch(error)
    {
        console.log(error)
    }
}



exports.VerifyVideo=async(req,res)=>{

    const flag=req.body.flag
    switch(flag)
    {
        case 'Approve':
            await PickCustomer.update({verified:true},{
                where:{
                    video_id:req.params.videoId
                }
            })
            res.status(200).send("Pickup video Approved!")
            break
        case 'reject':
            await PickCustomer.update({verified:false},{
                where:{
                    video_id:req.params.videoId
                }
            })
            res.status(200).send("Pickup video rejected")

    }
}