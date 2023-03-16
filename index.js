const express = require('express')
const mongoose = require('mongoose')
const app = express();
const bodyParser = require("body-parser");
const fileUpload = require('express-fileupload')

mongoose.set('strictQuery',false)
mongoose.connect('mongodb://127.0.0.1:27017/u-m-s')

app.set('view engine','ejs')
app.set('views', 'views')

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//to use static files
app.use(express.static('public')); 


//for user routes
const userRoute = require('./routes/userRoute')
app.use('/', userRoute)


//for admin routes
const adminRoute = require('./routes/adminRoute')
app.use('/admin', adminRoute)




app.listen('3000', function(){
    console.log("server is running");
})