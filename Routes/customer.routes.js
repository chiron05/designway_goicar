const express=require('express');
const { createCustomer, deleteCustomer, getCustomer, updateCustomer,getCustomerByPhone, getCustomerById, getCustomerByName } = require('../Controllers/customer.controller');
const customerRouter = express.Router();

const cloudinary=require('../Utils/cloudinary')
const upload=require('../Utils/multer')

customerRouter.get('/customer',getCustomer)
customerRouter.post('/customer', upload.fields([
    {
        name: 'id_front', maxCount: 1
    },
    {
        name: 'id_back', maxCount: 1
    },
    {
        name: 'driving_license', maxCount: 1
    }

]),createCustomer)
customerRouter.put('/customer/:id',updateCustomer)
customerRouter.delete('/customer/:id',deleteCustomer)
customerRouter.get('/customer/phonenumber/:no',getCustomerByPhone)
customerRouter.get('/customer/:id',getCustomerById)
customerRouter.get('/customer/customername/name', getCustomerByName)



module.exports=customerRouter

