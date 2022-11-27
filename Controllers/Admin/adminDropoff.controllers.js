// const pickCustomer=require('../Models/pickCustomer.model')
const DropCustomer = require('../../Models/dropCustomer.model')


exports.getdropvideo=async(req,res)=>{
    try{
        let drop_video = await DropCustomer.findAll({
           where:{
            booking_id:req.params.booking_id,
            isDeleted:false
           }
        })
        res.status(200).send(drop_video)

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
            await DropCustomer.update({verified:true},{
                where:{
                    video_id:req.params.video_id,
                    isDeleted:false
                }
            })
            res.status(200).send("Pickup video Approved!")
            break
        case 'reject':
            await DropCustomer.update({verified:false},{
                where:{
                    video_id:req.params.videoId,
                    isDeleted:false
                }
            })
            res.status(200).send("Pickup video rejected")

    }
}