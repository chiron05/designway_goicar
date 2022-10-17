const PickCustomer=require('../Models/pickCustomer.model.js')
const DropCustomer=require('../Models/dropCustomer.model')
const cloudinary=require('../Utils/cloudinary')
///if i want to put the switch case i have to import  both the models here
exports.DriverUpload=async(req,res,next)=>{
   var pickup=req.body.pickup
   if(pickup == 'true')
   {
    
    try{
        const result= await cloudinary.uploader.upload(req.file.path,{
            resource_type: "auto"
        })

       const pickup= await PickCustomer.update({video: result.secure_url,
        video_id:result.public_id},{
        where:{
            booking_id:req.body.booking_id
        }
        
    })
        if(pickup[0]){
            res.status(200).send("pickup video uploaded successful")
        }
        else{
            res.status(400).send('video not uploaded')
        }
       
      
    }
    catch(err)
    {
        res.status(400).send(err)
    }
   }
   else 
   {
    try {
        const result = await cloudinary.uploader.upload(req.file.path, {
            resource_type: "auto"
        })

       const dropoff= await DropCustomer.update({
            video: result.secure_url,
            video_id: result.public_id
        }, {
            where: {
                booking_id: req.body.booking_id
            }
        })
        if(dropoff[0]){
            res.status(200).send("dropoff video uploaded successful")
        }
        else{
            res.status(400).send('video not uploaded')
        }

    }
    catch (err) {
        console.log(err)
    }


   }
    
}

