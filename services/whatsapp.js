const { response } = require('express');

require('dotenv').config()

const accountSid = process.env.TWILLO_ACCOUNT_SID; 
const authToken = process.env.TWILLO_AUTH_TOKEN; 
const client = require('twilio')(accountSid, authToken); 
 
exports.whatsappNotify=async(message,number)=>{
    try {
      const sent=await  client.messages 
        .create({ 
           body: message, 
           from: 'whatsapp:+14155238886',       
           to: `whatsapp:+${number}` 
         }) 
    } catch (error) {
      return error
    }
        
}