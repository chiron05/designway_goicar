const crypto = require("crypto");
const request = require('request');
const jsSHA = require("jssha");
const Payment = require("../Models/payment.model");
const httpStatusCodes = require("../Constants/http-status-codes");
const { formResponse } = require("../Utils/helper");
const Booking = require("../Models/booking.model");

exports.payu_success=async(req,res)=>{
    console.log(req.body)
    Payment.update(
        { 
            mihpayid:req.body.mihpayid,
            mode:req.body.mode,
            txnid:req.body.txnid,
            discount:req.body.discount,
            net_amount_debit:req.body.net_amount_debit,
            addedon:req.body.addedon,
            payment_source:req.body.payment_source,
            bank_ref_num:req.body.bank_ref_num,
            bankcode:req.body.bankcode
        },
        { where: { booking_id: req.body.productinfo.slice(0, -1) } }
      )
        .then(result =>{
            if (result[0]) {

                Booking.update({
                    booking_status:"success"
                },{
                    where: { _id: req.body.productinfo.slice(0, -1) }
                }).then(data=>{
                    res.status(httpStatusCodes[200].code).json(formResponse(httpStatusCodes[200].code, `Payment successfully }`))
                }).catch(err=>{
                    console.log(err)
                res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, `Payment sucess but unable to set status of booking`))
                    
                })
            }
            else {
                res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, `sucess data not added on databse`))
            }
        }
        )
        .catch(err =>
            {   console.log(err)
                res.status(httpStatusCodes[400].code).json(formResponse(httpStatusCodes[400].code, err))
            }
           
        )
}

exports.payu = async (req, res) => {
    
    const txtid = crypto.randomBytes(16).toString("hex");

    console.log("yo "+req.body.amount.slice(0, -1)+" oy")

    req.body.txnid = txtid
    req.body.amount=req.body.amount.slice(0, -1)
    
    // console.log(JSON.parse(req.body.productinfo))

    const pay = req.body
    const hashString = 'JPM7Fg' //store in in different file
        + '|' + pay.txnid
        + '|' + pay.amount
        + '|' + pay.productinfo
        + '|' + pay.firstname
        + '|' + pay.email
        + '|' + '||||||||||'
        + 'TuxqAugd'

    const sha = new jsSHA('SHA-512', "TEXT");
    sha.update(hashString);
    const hash = sha.getHash("HEX");
    pay.key = 'JPM7Fg' //store in in different file;
    pay.surl = 'http://localhost:3000/payment/success'
    pay.furl = 'http://localhost:3000/payment/failure';
    pay.hash = hash;


   

    request.post({
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        url: 'https://test.payu.in/_payment',
        form: pay //Testing url
    }, function (error, httpRes, body) {
        if (error)
        {
            console.log(error)
            res.send(
                {
                    status: false,
                    message: error.toString()
                }
            );
            return;
        }
           
           
        if (httpRes.statusCode === 200) {
            console.log('heyy')
            res.send(body);
            // console.log('k')
        } else if (httpRes.statusCode >= 300 &&
            httpRes.statusCode <= 400) {
            res.redirect(httpRes.headers.location.toString());
        }
    })

}

exports.refund=(req,res)=>{
    request.post({
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        url: 'https://test.payumoney.com/payment/op/getPaymentResponse',
        form: pay //Testing url
    }, function (error, httpRes, body) {
       
    })

}