const axios=require('axios')


exports.sms_booking=async(customer_id,booking_id,customer_num,customer_name)=>{
    try {
        const response = await axios({
            url: `https://www.smsgatewayhub.com/api/mt/SendSMS?APIKey=Z6lNS9RVgU2mtn1jRkUaHg&senderid=GOICar&channel=2&DCS=0&flashsms=0&number=${customer_num}&text=Hello ${customer_name}
            You have received a link from Goicar. Here is your booking link <thelink> please click on the link to update your booking details. Click here: http://localhost:3000/track/${customer_id}/${booking_id}: goicar.in&route=1&EntityId=1701161303265683139&dlttemplateid=1707166565344586578`,
            method: "POST",
        });
       console.log("sms sent successfully")
    } catch (err) {
        console.log(err)
        console.log("Process Unsuccessfull")
    }
}

