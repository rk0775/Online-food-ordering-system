const mongoose=require('mongoose');
const User=mongoose.Schema({
    name:String,
    email:String,
    phone:String,
    password:String,
    address:String,
    type:String,
})
module.exports=mongoose.model("user",User);