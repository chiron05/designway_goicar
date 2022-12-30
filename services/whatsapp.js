const { response } = require('express');

require('dotenv').config()

const accountSid = process.env.TWILLO_ACCOUNT_SID; 
const authToken = process.env.TWILLO_AUTH_TOKEN; 
const client = require('twilio')(accountSid, authToken); 
 

exports.whatsappPickCustomerNotify=async(customer_name,booking_id,location,date,time,drivername,drivernumber,customer_number)=>{

  var countryCode=customer_number.slice(0, 2)
  var phoneNumber=customer_number.slice(2)

  var axios = require('axios');
  var data = JSON.stringify({
    "countryCode": `+${countryCode}`,
    "phoneNumber": `${phoneNumber}`,
    "callbackData": "some text here",
    "type": "Template",
    "template": {
      "name": `goicar_pickup_dropoff_notification`,
      "languageCode": "en",
      "headerValues": [
        "header_variable_value"
      ],
      "bodyValues": [
        `${customer_name}`,
        `${booking_id}`,
        `${location}`,
        `${date}`,
        `${time}`,
        `${drivername}`,
        `${drivernumber}`
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


exports.whatsappDropCustomerNotify=async(customer_name,booking_id,location,date,time,drivername,drivernumber,customer_number)=>{

  var countryCode=customer_number.slice(0, 2)
  var phoneNumber=customer_number.slice(2)

  var axios = require('axios');
  var data = JSON.stringify({
    "countryCode": `+${countryCode}`,
    "phoneNumber": `${phoneNumber}`,
    "callbackData": "some text here",
    "type": "Template",
    "template": {
      "name": `goicar_dropoff_notification_1i`,
      "languageCode": "en",
      "headerValues": [
        "header_variable_value"
      ],
      "bodyValues": [
        `${customer_name}`,
        `${booking_id}`,
        `${location}`,
        `${date}`,
        `${time}`,
        `${drivername}`,
        `${drivernumber}`
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



exports.whatsappDriverNotify=async(drivername,location,date,time,customer_name,customer_number,driver_number)=>{

  var countryCode=driver_number.slice(0, 2)
  var phoneNumber=driver_number.slice(2)

  var axios = require('axios');
  var data = JSON.stringify({
    "countryCode": `+${countryCode}`,
    "phoneNumber": `${phoneNumber}`,
    "callbackData": "some text here",
    "type": "Template",
    "template": {
      "name": `driver_notify_xs`,
      "languageCode": "en",
      "headerValues": [
        "header_variable_value"
      ],
      "bodyValues": [
        `${drivername}`,
        `${location}`,
        `${date}`,
        `${time}`,
        `${customer_name}`,
        `${customer_number}`
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