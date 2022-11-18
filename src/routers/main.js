const { Router } = require('express');
const express = require('express');
const session = require('express-session')
const route = express.Router();
const User = require('../modul/user')
const dish = require("../modul/dish");
const order = require('../modul/order')
const { __express } = require('hbs');
const { restart } = require('nodemon');
const fs = require('fs')

route.get("/", (req, res) => {
    const loginUser = req.session.loginUser;
    res.render("index", {
        loginUser: loginUser
    })
})
route.get("/register", (req, res) => {
    const loginUser = req.session.loginUser;
    res.render("registration", {
        loginUser: loginUser
    })
})
route.get('/login', (req, res) => {
    const loginUser = req.session.loginUser;
    res.render("login", {
        loginUser: loginUser
    })
})
//food page normal user
route.get("/foods/:page", async (req, res) => {
    const loginUser = req.session.loginUser;
    let currentPage = 1;
    let page = req.params.page;
    if (page)
        currentPage = page;
    const total = 6;
    const start = (currentPage - 1) * total;
    const foods = await dish.find().skip(start).limit(total);
    const count = Math.ceil(await dish.find().countDocuments() / total);

    console.log(count + " :=> " + foods);
    res.render("showDishes", {
        loginUser: loginUser,
        foods: foods,
        count: count,
        currentPage: currentPage

    })
})
route.post("/saveRegistration", async (req, res) => {
    const data = await User.create(req.body)
    res.render("login",{
        newRegister:true
    })
})

route.post("/loginUser", async (req, res) => {
    const data = await User.findOne(req.body);
    console.log(data);

    if (data == null) {
        console.log("invalid passward or email");
        res.render("login", {
            invalid: true,
            email: req.body.email
        })
    }
    else {
        req.session.loginUser = data;
        console.log('login user name : ' + req.session.loginUser.name);
        res.redirect("/dashboard");
    }
})

route.get("/dashboard", (req, res) => {
    if (req.session.loginUser) {
        const loginUser = req.session.loginUser;
        if (req.session.loginUser.type == 'normal') {
            console.log("normal user")
            res.render("userPages/userDashboard", {
                loginUser: loginUser
            });
        } else if (req.session.loginUser.type == 'admin') {
            console.log('admin user');
            res.render("adminDashboard", {
                loginUser: loginUser
            });
        }
    } else
        res.render("login", {
            loginFirst: true
        })
})

route.get("/admin/addDish", (req, res) => {
    if (req.session.loginUser) {
        const loginUser = req.session.loginUser;

        if (loginUser.type == "admin") {
            res.render("addNewDish", {
                loginUser: loginUser
            })
        } else {
            res.send(`<h1>Something Wrong !!</h1> <h2>Opps! you can not acess this page..</h2>`)
        }
    } else
        res.render("login", {
            loginFirst: true
        })
})

//this get method for show food table in admin pannel
route.get("/admin/dishMenus/:page", async function (req, res) {
    if (req.session.loginUser) {
        const loginUser = req.session.loginUser;
        let currentPage = 1;
        let page = req.params.page;
        if (page)
            currentPage = page;
        const total = 6;
        const start = (currentPage - 1) * total;
        const data = await dish.find().skip(start).limit(total);
        const newObject = Object.assign({}, data, { currentPage: currentPage })
        const totalPage = Math.ceil(await dish.find().countDocuments() / total)
        if (loginUser.type == "admin") {
            res.render("adminFoodTable", {
                loginUser: loginUser,
                foods: data,
                currentPage: currentPage,
                count: totalPage
            })
        } else {
            res.send(`<h1>Something Wrong !!</h1> <h2>Opps! you can not acess this page..</h2> `)
        }
    } else
        res.render("login", {
            loginFirst: true
        })
})

//search food dish by user
route.post("/searchFood", async (req, res) => {
    const loginUser = req.session.loginUser;
    const search = req.body.foodSearch
    const data = await dish.find({ "dname": new RegExp(search, 'i') });
    res.render("showDishes", {
        loginUser: loginUser,
        foods: data,
        searchKey: search
    })
})

//save dish here
route.post('/saveDish', async (req, res) => {


    if (req.files == null || req.body.ddiscount > 100 || req.body.dname == '' || req.body.dprice <= 0) {
        res.render("addNewDish", {
            notsave: true
        })
        return;
    }
    const { photo } = req.files;
    const imageName=Math.random()+photo.name;
    req.body.photo = imageName;
    const data = await dish.create(req.body)

    photo.mv("D:/document/projects/Restorent/public/dishImage/" + imageName);
    if (data) {
        console.log("dish save")
        res.render("addNewDish", {
            save: true
        })
    } else {
        console.log("dish not save")
        res.render("addNewDish", {
            notsave: true
        })
    }
})

//delete the dish
route.get('/admin/deleteDish/:id', async (req, res) => {
    if (req.session.loginUser) {
        const loginUser = req.session.loginUser
        const data = await dish.deleteOne({ "_id": req.params.id })
        if (data) {
            console.log("file is deleted...")

            currentPage = 1;
            const total = 6
            const start = (currentPage - 1) * total
            const foods = await dish.find().skip(start).limit(total)
            const totalPage = Math.ceil(await dish.find().countDocuments() / total)
            res.render("adminFoodTable", {
                loginUser: loginUser,
                foods: foods,
                currentPage: 1,
                count: totalPage,
                delete: true
            })
        } else {
            res.send("<h1>Server Error !!</h1><h2> Soory dish is not deleted p;ease try letter..</br><a href='/admin/dishMenus/1'>Back to dish menu table</a> </h2>")
        }
    } else
        res.render("login", {
            loginFirst: true
        })

})
//place order
route.get("/admin/adminOrder/:page", async (req, res) => {
    if (req.session.loginUser) {
        const loginUser = req.session.loginUser;
        if (loginUser.type == 'admin') {
            let currentPage = 1;
            const page = req.params.page;
            if (page)
                currentPage = page;
            const total = 10;
            const start = (currentPage - 1) * total;
            const data = await order.find().skip(start).limit(total);
            const totalPage = Math.ceil(order.find().countDocuments() / total);
            console.log("place order" + data)
            res.render('adminOrders', {
                loginuser: loginUser,
                orders: data,
                currentPage: currentPage,
                count: totalPage
            })

        }
    } else {
        res.render("login", {
            loginFirst: true
        })
    }
})

//change order states
route.get("/admin/cooking/:id", async (req, res) => {
    if (req.session.loginUser) {
        if (req.session.loginUser.type == 'admin') {
            
            const data = await order.updateOne({ _id: req.params.id }, { $set: { states: "Cooking" } })
            res.redirect("/admin/adminOrder/1")
        }else
        res.send("<h2>Wrong page try to access...</h2>")
    } else {
        res.render("login", {
            loginFirst: true
        })
    }
})
route.get("/admin/deliver/:id", async (req, res) => {
    if (req.session.loginUser) {
        if (req.session.loginUser.type == 'admin') {
        
            const data = await order.updateOne({ _id: req.params.id }, { $set: { states: "Out for deliver." } })
            
            res.redirect("/admin/adminOrder/1")
        }else
        res.send("<h2>Wrong page try to access...</h2>")
    } else {
        res.render("login", {
            loginFirst: true
        })
    }
})
route.get("/admin/handover/:id", async (req, res) => {
    if (req.session.loginUser) {
        if (req.session.loginUser.type == 'admin') {
            console.log("function i scalled")
            const data = await order.updateOne({ _id: req.params.id }, { $set: { states: "Order completed." } })
    
            res.redirect("/admin/adminOrder/1")
        }else
        res.send("<h2>Wrong page try to access...</h2>")
    } else {
        res.render("login", {
            loginFirst: true
        })
    }
})

//edit dish here
route.get("/admin/editDish/:id/:flag", async (req, res) => {
    if (req.session.loginUser) {
        const loginUser = req.session.loginUser
        if (loginUser.type == 'admin') {
            const data = await dish.findById(req.params.id)
            const flag = req.params.flag
            if (data) {
                res.render("adminEditDish", {
                    food: data,
                    loginUser: loginUser
                })
            } else {
                res.send(`<h1>Something Wrong !!</h1> <h2>Opps! Dish not Found...</h2> `)

            }

        } else {
            res.send(`<h1>Something Wrong !!</h1> <h2>Opps! you can not acess this page..</h2> `)
        }
    } else
        res.render("login", {
            loginFirst: true
        })
})

route.post("/admin/saveEditDish/:id", async (req, res) => {

    if (req.session.loginUser) {

        if (req.files == null)
            console.log("photo not selected")
        else {
            console.log("photo to is selected ols photo is " + req.body.tempImage)
            try {
                fs.unlinkSync('D:/document/projects/Restorent/public/dishImage/' + req.body.tempImage)
                console.log('old file is deleted')
            } catch (e) {
                console.log(e)
            }
            const { photo } = req.files
            const imageName=Math.random()+photo.name;
            req.body.photo =imageName;
            photo.mv("D:/document/projects/Restorent/public/dishImage/" + imageName);
            console.log(req.body.photo)
        }

        const data = await dish.updateOne({ _id: req.params.id }, { $set: req.body })
        if (data) {
            console.log("dish updated")
            res.redirect("/admin/editDish/" + req.params.id + "/success")
        } else {
            console.log('dish not updated')
            res.redirect("/admin/editDish/" + req.params.id + "/error")

        }
    } else
        res.render("login", {
            loginFirst: true
        })
})
route.get("/logout", (req, res) => {
    req.session.destroy();
    res.render("login", {
        logout: true
    })
})

//check out
route.get("/user/orderFood", (req, res) => {
    if (req.session.loginUser) {
        const loginUser = req.session.loginUser
        res.render("userPages/userCheckout", {
            loginUser: loginUser
        })
    } else {
        res.render("login", {
            loginFirst: true
        })
    }
})

route.post("/orderNowFromBasket", (req, res) => {
    if (req.session.loginUser) {
        res.redirect("/")
        const loginUser = req.session.loginUser;
        const basket = JSON.parse(req.body.data)
        let dt_ob = new Date();
        let dateTime = "" + ("0" + dt_ob.getDate()).slice(-2) + "/" + ("0" + dt_ob.getMonth()).slice(-2) + "/" + dt_ob.getFullYear() + " T " + dt_ob.getHours() + ":" + dt_ob.getMinutes() + ":" + dt_ob.getSeconds();
        const paymentType = req.body.paymentType

        basket.forEach(async function (item) {
            let object = {
                dishId: item.id,
                userId: loginUser._id,
                user: loginUser,
                photo: item.image,
                dname: item.name,
                time: dateTime,
                price: item.price,
                quantity: item.quantity,
                paymentType: paymentType,
                states: "NA"//not active order
            }
            console.log(object)
            const data = await order.create(object);
            console.log(data)
            if (data) {
                console.log('data is save');
            }

        });
    } else {
        res.render("login", {
            loginFirst: true
        })
    }
})

//order page
route.get("/user/orders", async (req, res) => {
    if (req.session.loginUser) {
        const loginUser = req.session.loginUser;
        const data = await order.find({ $and: [{ "states": { $ne: "deliverd" } }, { "userId": req.session.loginUser._id }] });
        console.log("find data : " + data)
        res.render("userPages/userOrders", {
            loginUser: loginUser,
            orderFood: data
        })
    } else {
        res.render("login", {
            loginFirst: true
        })
    }
})

route.get("/user/cancelOrder/:id", async (req, res) => {
    if (req.session.loginUser) {
        const loginUser = req.session.loginUser;
        const deleteData = await order.deleteOne({ _id: req.params.id });


        const data = await order.find({ $and: [{ "states": { $ne: "deliverd" } }, { "userId": req.session.loginUser._id }] });
        console.log("find data : " + data)
        if (deleteData)
            res.render("userPages/userOrders", {
                loginUser: loginUser,
                orderFood: data,
                cancelOrder: true
            })
    } else {
        res.render("login", {
            loginFirst: true
        })
    }
})

route.get("/user/history", async (req, res) => {
    if (req.session.loginUser) {

        const loginUser = req.session.loginUser;
        const data = await order.find({ "userId": req.session.loginUser._id });


        res.render("userPages/userHistory", {
            loginUser: loginUser,
            history: data
        })
    } else {
        res.render("login", {
            loginFirst: true
        })
    }
})

module.exports = route