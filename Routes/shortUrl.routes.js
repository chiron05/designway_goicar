const express=require('express')
const { userDetails } = require('../Controllers/shortUrl.controller')
const shortUrlRoute=express.Router()


shortUrlRoute.get('/shorturl/:uniqueid',userDetails)


module.exports=shortUrlRoute