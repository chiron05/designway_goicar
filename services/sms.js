const axios=require('axios')


exports.sms=async()=>{
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
      console.log("sms sent successfully")
    } catch (err) {
        console.log(err)
        console.log("Process Unsuccessfull")
    }
}

