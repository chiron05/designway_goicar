const express=require('express');
const {payu, payu_success, refund}=require('../Controllers/payu.controller.js');
const Payment = require('../Models/payment.model.js');
const pay_router=express.Router()

pay_router.post('/payment_gateway/payumoney',payu)
pay_router.post('/payment/success',payu_success)
pay_router.post('/payment/failure',(req,res)=>{
    res.send(req.body)
})

pay_router.post('/payment_gateway/refund',refund)



module.exports=pay_router