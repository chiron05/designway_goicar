const {Router}=require('express');
const authenticatToken = require('../Auth/verify');
const { signup, login, driverlogin, driversignin, verifyOtp } = require('../Controllers/auth.controller');
const upload=require('../Utils/multer')

const authRouter=Router();


authRouter.post('/login',login);
authRouter.post('/signup',upload.single('id_proof'),signup);
authRouter.post('/driver/login',driversignin);
authRouter.post('/driver/login/verifyotp',verifyOtp);


// authRouter.get('/logout',authenticatToken,logout_get);



module.exports=authRouter