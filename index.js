const express = require('express')
const mongoose = require('mongoose')
const app = express();
const bodyParser = require("body-parser");
const fileUpload = require('express-fileupload')

mongoose.set('strictQuery',false)
mongoose.connect(
  "mongodb+srv://amdazzlin01:Y51FNAqJA1JqlQyz@cluster0.tabpewl.mongodb.net/test"
);

app.set('view engine','ejs')
app.set('views', 'views')

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



//to use static files
app.use(express.static('public')); 


//for user routes
const userRoute = require('./routes/user_route')
app.use('/', userRoute)


//for admin routes
const adminRoute = require('./routes/admin_route')
app.use('/admin', adminRoute)




app.listen('3000', function(){
    console.log("server is running");
})