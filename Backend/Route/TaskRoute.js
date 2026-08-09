const express=require('express')
const Router=express.Router()

const auth=require('../Middleware/auth')


const UserController=require('../Controller/UserController')
const TaskController=require('../Controller/TaskController')

Router.post('/singup',UserController.singup)
Router.post('/login',UserController.login)

Router.post('/addtask',auth,TaskController.addtask)
Router.post('/addtasksheet',auth,TaskController.googlesheetadd)
Router.get('/gettask/:userid',auth,TaskController.gettask)
Router.patch('/taskstatus',auth,TaskController.taskstatus)
Router.put('/taskupdate',auth,TaskController.updatetask)
Router.delete('/taskdelete/:id',auth,TaskController.deletetask)

module.exports=Router