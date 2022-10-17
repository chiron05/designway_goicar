const express=require('express')

const { 
    getUsers,
    createUser,
    updateUser,
    deleteUser
  
}=require('../Controllers/user.controller.js')

const user_router =express.Router()

user_router.get('/',getUsers)
user_router.post('/',createUser)
user_router.put('/:id',updateUser)
user_router.delete('/:id',deleteUser)

module.exports=user_router