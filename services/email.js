const { response } = require('express');
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_ID,
    pass: process.env.EMAIL_PASSWORD
  }
});




exports.emailNotify=async(to,subject,text)=>{
  
    try {
      var mailOptions = {
        from: 'sarthaknaik010@gmail.com',
        to,
        subject,
        text,
        html: text
      };
   const sent= await transporter.sendMail(mailOptions);
    } catch (error) {
      return error
    }
    
}

