const mongoose = require('mongoose')


const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true
    },   
    email:{
        type:String,
        required:true,
        unique:true
    },
    mobilenumber:{
        type:Number,
        required:true
    },
    gender:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    is_verified:{
        type:String,
        default:0
    },
    block:{
        type:String,
        default:false
    },
    address:[
        {
            name:{type:String},
            house:{type:String},
            post:{type:String},
            city:{type:String},
            district:{type:String},
            state:{type:String},
            pin: { type: Number },
            phone:{type:Number}

        }
    ],
    
    token: {
        type: String,
        default:''
    }
  
})

module.exports = mongoose.model('User', userSchema)