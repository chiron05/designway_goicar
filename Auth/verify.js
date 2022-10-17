const jwt=require('jsonwebtoken')
const httpStatusCodes = require('../Constants/http-status-codes')
const { formResponse } = require('../Utils/helper')


const authenticatToken=async(req,res,next)=>{
    const token=req.cookies.jwt;
    if (token == null) return res.status(httpStatusCodes[401].code)
    .json(formResponse(httpStatusCodes[401].code, "Token not found"));
    try {
        const data = await jwt.verify(token,'secret bhaii');
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

module.exports=authenticatToken