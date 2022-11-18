const express=require("express");
const app=express();
app.listen(3232,(res,req)=>{
    res.send("<h2>HI</h2>")
    console.log("hellow");
})