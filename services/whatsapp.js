const { response } = require('express');

require('dotenv').config()

const accountSid = process.env.TWILLO_ACCOUNT_SID; 
const authToken = process.env.TWILLO_AUTH_TOKEN; 
const client = require('twilio')(accountSid, authToken); 
 

exports.whatsappNotify=async(message_template,number)=>{

  var countryCode=number.slice(0, 2)
  var phoneNumber=number.slice(2)

  var axios = require('axios');
  var data = JSON.stringify({
    "countryCode": `+${countryCode}`,
    "phoneNumber": `${phoneNumber}`,
    "callbackData": "some text here",
    "type": "Template",
    "template": {
      "name": `${message_template}`,
      "languageCode": "en",
      "headerValues": [
        "header_variable_value"
      ],
      "bodyValues": [
        "Sarthak Naik",
        "https://localhost"
      ]
    }
  });
  
  var config = {
    method: 'post',
    url: 'https://api.interakt.ai/v1/public/message/',
    headers: { 
      'Authorization': `Basic ${process.env.WHATSAPP_SECRET_KEY}`, 
      'Content-Type': 'application/json'
    },
    data : data
  };
  
  axios(config)
  .then(function (response) {
    console.log(JSON.stringify(response.data));
  })
  .catch(function (error) {
    console.log(error);
  });
}  