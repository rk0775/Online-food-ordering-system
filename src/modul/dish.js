const mongoose=require("mongoose")
const dish=mongoose.Schema({
    dname:String,
    dtype:String,
    dprice:Number,
    dtime:String,
    photo:String,
    discription:String,
    ddiscount:Number,
    dserve:Number
})
module.exports=mongoose.model("dish",dish)