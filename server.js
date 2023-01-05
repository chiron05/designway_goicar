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



app.listen(port,()=>{
    console.log(`Server listening port http://localhost:${port}`);
})
