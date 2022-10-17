const jwt=require('jsonwebtoken')
const httpStatusCodes = require('../Constants/http-status-codes');
const User=require('../Models/User')
const { formResponse } = require('../Utils/helper');


const tokenAuthentication=async(req,res,next)=>{
    const authHeader=req.headers['authorization'];
    const token=authHeader && authHeader.split(' ')[1]

    if(token==null){
        return res.status(httpStatusCodes[401].code)
        .json(formResponse(httpStatusCodes[401].code, "Token not found"));
    }
    try {
        let getservertoken=await User.findAll({
            where:{token}});
        if(!getservertoken){
            res.status(httpStatusCodes[401].code)
            .json(formResponse(httpStatusCodes[401].code, "Token Expired or Invalid"))
        return;
        }
        const data = await jwt.verify(token,process.env.JWT_SECRET);
        console.log(data)
        req.userId = data.id.userId;
        req.userRole = data.id.userRole;
        return next();
    } catch (error) {
        console.log(error)
        res.status(httpStatusCodes[401].code)
        .json(formResponse(httpStatusCodes[401].code, "Token Expired or Invalid"))
       return;
    }
}

module.exports=tokenAuthentication