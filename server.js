require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const mysql=require('mysql')
const db=require('./config/db.js')
const router=require('./Routes/index')
const tokenAuthentication = require('./Auth/tokenVerification.js');
const port = process.env.PORT || 3000;
const app = express();
const helmet=require('helmet')
const axios=require('axios')
const cors = require('cors');
const { sms } = require('./services/sms.js');
const { emailNotify } = require('./services/email.js');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine','ejs')
// app.use(helmet())
app.use(cors())

db.authenticate().then(()=>{
    console.log("DB Connected")
}).catch(err=>{
    console.log(err)
})

app.use(router)
app.get('/token',tokenAuthentication)

app.get("/", (req, res) => {
    console.log('yes')
    res.send(`app working ` + new Date().toLocaleTimeString());
});


app.get('/email',(req,res)=>{
  var message=`
  <p style='font-weight:bold;'> Hi. My name is John </p>
  <h1>i am having pick up at</h1></br>
  <h1>at this location</h1>
  `

  emailNotify('sarthaknaik010@gmail.com','pata nahi',message)

  res.send('done')

})

app.get('/whatsapp',(req,res)=>{
 var axios = require('axios');
var data = JSON.stringify({
  "countryCode": "+91",
  "phoneNumber": "8390076015",
  "callbackData": "some text here",
  "type": "Template",
  "template": {
    "name": "goicar_booking_details",
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

})




app.listen(port,()=>{
    console.log(`Server listening port http://localhost:${port}`);
})
