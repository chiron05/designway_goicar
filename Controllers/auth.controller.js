const httpStatusCodes = require('../Constants/http-status-codes')
const { formResponse } = require("../Utils/helper");
const upload=require('../Utils/multer')
const cloudinary=require('../Utils/cloudinary');
const User=require('../Models/User')
const jwt=require('jsonwebtoken');
const {  authPhoneSchema,authSchema } = require('../Joi/auth.validation')
const { createUserSchema } = require('../Joi/user.validation');
const { Op, Sequelize } = require('sequelize')
const maxAge=3*24*60*60;
const createToken=(id)=>{
    return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn:maxAge
    })
}


checkCerdentials=async(email,password)=>{
    const user=await User.findAll({
        attributes:['password','role','id','token'],
        where:{
            email:email,
            isDeleted:false
        }});
    if(user.length==0){
        
            throw Error('Incorrect Email')
        }
    let userPassword=user[0].dataValues.password
    if(user){
        if(userPassword==password){
            return user
        }
        throw Error('Incorect password')
    }
    
}

checkCerdentialsByPhoneNumber=async(phone_number,password)=>{
    const user=await User.findAll({
        attributes:['password','role','id','token'],
        where:{
            phone_number:phone_number,
            isDeleted:false
        }});
    if(user.length==0){
        
        throw Error('Incorrect Phone Number')
    }
    let userPassword=user[0].dataValues.password
    if(user){
        if(userPassword==password){
            return user
        }
        throw Error('Incorect password')
    }
   
}

exports.driverlogin=async(req,res)=>{
    
    const {error,value}=authPhoneSchema.validate(req.body);
    if(error){
      return  res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code,error))      
    }
    else{
        try {
            const user=await checkCerdentialsByPhoneNumber(req.body.phone_number,req.body.password);
            const token=createToken({userId:user[0].dataValues.id,userRole:user[0].dataValues.role});
            try {
             const addTokenToServer=await User.update({token:token},{where:{
                 id:user[0].dataValues.id,
                 isDeleted:false
             }})
         } catch (error) {
            res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code,error))   
         }   
         req.userId=user[0].dataValues.id

         const ServerToken=await User.findOne({
            where:{
                token:token,
                isDeleted:false
            }
        })
        
         res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code,{
             token:ServerToken.dataValues.token
         }))   
     
         } catch (err) {
          res.status(400).json({
                  message:"Login Unsuccessfull",
                  error:err.message
              })
         }
    }

}

exports.login=async(req,res)=>{

    const {error,value}=authSchema.validate(req.body);
    if(error){
        res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code,error))      
    }
    else{
        try {
           
            const user=await checkCerdentials(req.body.email,req.body.password);
            const token=createToken({userId:user[0].dataValues.id,userRole:user[0].dataValues.role});
            try {
             const addTokenToServer=await User.update({token:token},{where:{
                 id:user[0].dataValues.id,
                 isDeleted:false
             }})
           
         } catch (error) {
            res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code,error))   
         }   
         req.userId=user[0].dataValues.id
        const ServerToken=await User.findOne({
            where:{
                token:token,
                isDeleted:false
            }
        })

         res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code,{
             token:ServerToken.dataValues.token
         }))   
     
         } catch (err) {
          res.status(400).json({
                  message:"Login Unsuccessfull",
                  error:err.message
              })
         }
    }

 }
exports.signup=async(req,res)=>{
    const {error,value}=authSchema.validate(req.body);
    if(error){
       return res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code,error))      
    }
    else{
        try {
            const result=await cloudinary.uploader.upload(req.file.path);
            const existingUser=await User.findOne({ 
                where:Sequelize.and(
                    {
                        isDeleted:true
                    },Sequelize.or(                   
                            {email:req.body.email},
                            {phone_number:req.body.phone_number}
                    )                          
            )
            })
        
           
           if(existingUser){
                const updateExistingUser=await User.update({
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
                    "message":"User's Account Reactivated"
                }))    
           }

               const user = await User.create({
                role:req.body.role,
                full_name:req.body.full_name,
                email:req.body.email,
                phone_number:req.body.phone_number,
                password:req.body.password,
                id_proof:result.url,
               })
               const token=createToken({userId:user.id,userRole:user.role});
               try {
                   const addTokenToServer=await User.update({token:token},{where:{
                       id:user.id,
                       isDeleted:false
                   }})
               } catch (error) {
                  console.log(error)
                  res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code,error))   
               }   
                  res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code,user))   
            } catch (error) {
                console.log(error)
                  res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code,{
                    "message":"User not created",
                    "Error":error.errors
                  }))   
        
            }
    }

   
}