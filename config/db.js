const mysql = require("mysql2");
const { Sequelize }= require('sequelize')
const dotenv=require('dotenv')
dotenv.config()

const DB=new Sequelize(process.env.db,process.env.User,process.env.pass,{
    host:process.env.DATABASE_HOST,
    dialect:'mysql',
    logging:false,
    pool:{max:5000,min:0,idle:10000},
   
 
})

  module.exports=DB