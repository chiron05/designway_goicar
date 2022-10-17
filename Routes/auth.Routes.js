const {Router}=require('express');
const authenticatToken = require('../Auth/verify');
const { signup, login } = require('../Controllers/auth.controller');
const upload=require('../Utils/multer')

const authRouter=Router();


authRouter.post('/login',login);
authRouter.post('/signup',upload.single('id_proof'),signup);
// authRouter.get('/logout',authenticatToken,logout_get);



module.exports=authRouter