const httpStatusCodes = require("../Constants/http-status-codes")
const { updateUserSchema, deleteUserSchema } = require("../Joi/user.validation")
const User = require("../Models/User")
const { formResponse } = require("../Utils/helper")

exports.updateUser=async(req,res)=>{
    if(Object.keys(req.body).length === 0){
        return  res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code,"Body is empty"))    
    }
    let validationObject={
        ...req.body,
        id:req.params.id
    }
    const {error,value}=updateUserSchema.validate(validationObject);
    if(error){
       return res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code,error))      
    }
    if(Object.keys(req.body).length === 0){
      return  res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code,"Please provide data through body"))
    }
    User.update(req.body,{
       where:{
        id:req.params.id,
        isDeleted:false
       }
    }).then((result)=>{
       
        if(result[0]){
            res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code,"Updated successfully"))
        }
        else{
            res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code,`Update unsuccessfull for user ${req.params.id}`))
        }

    }).catch((err)=>{
        console.log(err)
        res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code,err))
    })
}

exports.getUser=async(req,res)=>{
    const users=await User.findAll();
    res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code,users))
}

exports.deleteUser=async(req,res)=>{
    
    const {error,value}=deleteUserSchema.validate({id:req.params.id});
    if(error){
       return res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code,error))      
    }
    User.update({
        isDeleted:true
    },{
        where:{
         id:req.params.id,
         isDeleted:false
        }
     }).then((result)=>{
        
         if(result[0]){
             res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code,"Deleted successfully"))
         }
         else{
             res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code,`Deleted unsuccessfull for user ${req.params.id}`))
         }
 
     }).catch((err)=>{
         console.log(err)
         res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code,err))
     })
}