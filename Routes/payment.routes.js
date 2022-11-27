const express=require('express');
const { genrateInvoice } = require('../Controllers/payment.controller');
const { refund } = require('../Controllers/payu.controller');

const paymentRouter=express.Router()

paymentRouter.post('/payment/:id',genrateInvoice)


module.exports=paymentRouter