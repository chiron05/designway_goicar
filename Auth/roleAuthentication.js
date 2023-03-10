const httpStatusCodes = require('../Constants/http-status-codes')
const { formResponse } = require('../Utils/helper')

const roleAuthentication=(permissions)=>{
 return (req,res,next)=>{
    const userRole= req.userRole;
    if(permissions.includes(userRole)){
        next()
    }
    else{
        return res.status(httpStatusCodes[401].code).json(formResponse(httpStatusCodes[401].code, "You don't have permission to access this route"));
    }
 }
}

module.exports=roleAuthentication;