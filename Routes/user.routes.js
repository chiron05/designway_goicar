const express = require('express');
const { updateUser, deleteUser } = require('../Controllers/user.controller');

const user_routes=express.Router();

user_routes.put('/user/:id',updateUser)
user_routes.delete('/user/:id',deleteUser)

module.exports=user_routes