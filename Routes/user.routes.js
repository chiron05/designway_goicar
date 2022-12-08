const express = require('express');
const { updateUser, deleteUser, getUser } = require('../Controllers/user.controller');

const user_routes=express.Router();

user_routes.get('/user',getUser)
user_routes.put('/user/:id',updateUser)
user_routes.delete('/user/:id',deleteUser)

module.exports=user_routes

