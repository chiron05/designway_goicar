const express=require('express');
const { createCustomer, deleteCustomer, getCustomer, updateCustomer } = require('../Controllers/customer.controller');
const customerRouter = express.Router();

const cloudinary=require('../Utils/cloudinary')
const upload=require('../Utils/multer')

customerRouter.get('/customer',getCustomer)
customerRouter.post('/customer',upload.single('idProofURL'),createCustomer)
customerRouter.put('/customer/:id',updateCustomer)
customerRouter.delete('/customer/:id',deleteCustomer)




module.exports=customerRouter

