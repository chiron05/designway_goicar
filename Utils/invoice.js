exports.generateInvoice=(rent,pickUp,dropOff,fuel,insurance,liability,OSTax,GST,Deposit)=>{
    return 6*rent+pickUp+dropOff+fuel+insurance+liability+OSTax+GST+Deposit
}