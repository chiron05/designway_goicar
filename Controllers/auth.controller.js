const httpStatusCodes = require('../Constants/http-status-codes')
const { formResponse } = require("../Utils/helper");
const upload=require('../Utils/multer')
const cloudinary=require('../Utils/cloudinary');
const User=require('../Models/User')
const jwt=require('jsonwebtoken');
const maxAge=3*24*60*60;
const createToken=(id)=>{
    return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn:maxAge
    })
}

checkCerdentials=async(email,password)=>{
    const user=await User.findAll({
        attributes:['password','role','id','token'],
        where:{email:email}});
    let userPassword=user[0].dataValues.password
    if(user){
        if(userPassword==password){
            return user
        }
        throw Error('Incorect password')
    }
    throw Error('Incoorect Email')
}


exports.login=async(req,res)=>{
    try {
        
       const user=await checkCerdentials(req.body.email,req.body.password);
       const token=createToken({userId:user[0].dataValues.id,userRole:user[0].dataValues.role});
       try {
        const addTokenToServer=await User.update({token:token},{where:{
            id:user[0].dataValues.id
        }})
    } catch (error) {
       res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code,error))   
    }   
    req.userId=user[0].dataValues.id
   
    res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code,{
        token:user[0].dataValues.token
    }))   

    } catch (err) {
     res.status(400).json({
             message:"Login Unsuccessfull",
             error:err.message
         })
    }
 }
exports.signup=async(req,res)=>{
    try {
    const result=await cloudinary.uploader.upload(req.file.path);
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
               id:user.id
           }})
       } catch (error) {
          res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code,error))   
       }   
          res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code,user))   
    } catch (error) {
        console.log(error)
          res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code,"User Not Created"))   

    }
}