const express=require('express')
const mongoose=require('mongoose')
const cors=require('cors')
require('dotenv').config()

const app=express()

app.use(cors())
app.use(express.json())

const port=process.env.port

mongoose.connect(process.env.url)
.then((res)=> console.log("connected to mongodb"))
.catch((err)=> console.log(err))

const TaskRoute=require('./Route/TaskRoute')
app.use('/task',TaskRoute)



app.listen(port,()=>{
    console.log("server running",port)   
})