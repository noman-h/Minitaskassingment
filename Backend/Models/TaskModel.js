const mongoose=require('mongoose')

const taskschema=mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    duedate:{
        type:Date,
        required:true
    },
    status:{
        type:String,
        enum:["pending","completed","notcompleted"],
        default:"pending"
    },
    userid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users',
        required:true
    },
    importid: {
    type: String,
    default: null
}
},
{
    timestamps:true,
    versionkey:false
}
)

module.exports=mongoose.model('tasks',taskschema)