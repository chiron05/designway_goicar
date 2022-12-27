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
// https://www.smsgatewayhub.com/api/mt/SendSMS?APIKey=Z6lNS9RVgU2mtn1jRkUaHg&senderid=GOICar&channel=2&DCS=0&flashsms=0&number=918796728930&text=Hi test Greetings from Goicar ! Click the below link for the list of available vehicles for your rental period: goicar.in&route=1&EntityId=1701161303265683139&dlttemplateid=1707166565344586578
app.get('/sms',async(req,res)=>{
    try {
		// const response = await axios({
		// 	url: `https://www.smsgatewayhub.com/api/mt/SendSMS?APIKey=Z6lNS9RVgU2mtn1jRkUaHg&senderid=GOICar&channel=2
        //     &DCS=0&flashsms=0&number=918390076015&text=heyy sarthak&route=DLT ROUTE`,
		// 	method: "get",
		// });
		const response = await axios({
			url: `https://www.smsgatewayhub.com/api/mt/SendSMS?APIKey=Z6lNS9RVgU2mtn1jRkUaHg&senderid=GOICar&channel=2&DCS=0&flashsms=0&number=918530364072&text=Hi test Greetings from Goicar ! Click the below link for the list of available vehicles for your rental period: goicar.in&route=1&EntityId=1701161303265683139&dlttemplateid=1707166565344586578`,
			method: "POST",
		});
		res.status(200).json(response.data);
	} catch (err) {
		res.status(500).json({ message: err });
	}
})





app.listen(port,()=>{
    console.log(`Server listening port http://localhost:${port}`);
})
