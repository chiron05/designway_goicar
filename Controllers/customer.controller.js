const httpStatusCodes = require('../Constants/http-status-codes');
const Customer = require('../Models/customer.model');
const cloudinary=require('../Utils/cloudinary');
const { formResponse } = require('../Utils/helper');
const { any } = require('../Utils/multer');
const upload=require('../Utils/multer')

exports.deleteCustomer=async(req,res,next)=>{
    Customer.destroy({
        where:{
            _id:req.params.id
        }
    }).then(result=>{
        if(result){
            res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code,`Customer Deleted successfully`))
        }
        else{
            res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code,`No Customer available for CustomerID: ${ req.params.id}`))
        }     
    }).catch(err=>{
        res.status(httpStatusCodes[404].code)
        .json(formResponse(httpStatusCodes[404].code, err))
    })
}

exports.updateCustomer=async(req,res,next)=>{
    Customer.update(
        req.body,
        { where: { _id: req.params.id } }
      )
        .then(result =>{
            if(result[0]){
                res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code,`Customer Updated successfully`))
            }
            else{
                res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code,`No Customer available for CustomerID: ${ req.params.id}`))
            }     
        }     
        )
        .catch(err =>
            res.status(httpStatusCodes[404].code)
            .json(formResponse(httpStatusCodes[404].code, err))
        )
}

exports.getCustomer=async(req,res)=>{
    Customer.findAll({
        attributes:["_id","booking_id","firstName","lastName","email","phoneNumber","idProofURL"],
    }).then(result=>{
        res.status(httpStatusCodes[200].code)
        .json(formResponse(httpStatusCodes[200].code, result))
    }).catch(err=>{
        res.status(httpStatusCodes[404].code)
        .json(formResponse(httpStatusCodes[404].code, err))
    })
}

exports.createCustomer=async(req,res,next)=>{

    try {
        const result=await cloudinary.uploader.upload(req.file.path);
        let data= Customer.build({
            firstName:req.body.firstName,
            lastName:req.body.lastName,
            email:req.body.email,
            phoneNumber:req.body.phoneNumber,
            phoneNumber:req.body.phoneNumber,
            idProofURL:result.url
        })

        await data.save();

        if(data.errors){
            res.status(httpStatusCodes[404].code)
            .json(formResponse(httpStatusCodes[404].code, data.errors))
        }
        else{
            res.status(httpStatusCodes[200].code)
            .json(formResponse(httpStatusCodes[200].code, data))
        }
       
       
    } catch (error) {
        res.status(httpStatusCodes[404].code)
        .json(formResponse(httpStatusCodes[404].code, error))
    
    }


}

