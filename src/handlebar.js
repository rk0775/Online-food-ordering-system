const { handlebars } = require("hbs");

handlebars.registerHelper('times', function (n, block) {
    var accum = '';
    for (var i = 1; i <= n; i++)
        accum += block.fn(i)
    return accum;
});
handlebars.registerHelper('nextPage', function (n, block) {
    return Number(n) + 1;
})
handlebars.registerHelper('prevPage', function (n, block) {
    return Number(n) - 1;
})

handlebars.registerHelper('ifnext', function (currentPage, endPage, block) {
    if (Number(currentPage) >= Number(endPage))
        return 'disabled';
    else
        return false;
})
handlebars.registerHelper('ifprev', function (currentPage, block) {
    console.log(currentPage)
    if (Number(currentPage) <= 1)
        return 'disabled';
    else
        return false;
})
handlebars.registerHelper("active", function (active, currentPage, block) {
    console.log(active + " :: " + currentPage)
    if (active == currentPage)
        return 'active'
    else
        return false;
})
handlebars.registerHelper('json', function (context) {
    return JSON.stringify(context).replace(/"/g, '&quot;');
})

handlebars.registerHelper('discount', function (price, discount, block) {
    console.log("discount is " + (price - ((price * discount) / 100)));

    let discountPrice = parseFloat(price - ((price * discount) / 100)).toFixed(2);
    console.log(price + "%" + discount + " discount price is : " + discountPrice)
    return discountPrice;
})

handlebars.registerHelper("ifStates", function (states, id, block) {
    console.log(states)
    if (states == "NA") {
        return '<td><a href="/admin/cooking/' + id + '" class="btn states-btn btn-outline-success btn-sm">Cooking</a></td>';
    } else if (states == "Cooking") {
        return '<td><a href="/admin/deliver/' + id + '" class="btn states-btn btn-outline-warning btn-sm ">Deliver</a></td>';
    }else if(states == "Out for deliver."){
        return '<td><a href="/admin/handover/' + id + '" class="btn states-btn btn-outline-danger btn-sm">Handover</a></td>';
    }else{
        return '<td><a class="btn btn-outline-dark states-btn btn-sm disabled">Completed</a></td>';
    }
})

handlebars.registerHelper("ifCancelOrder",function(states,id,block){
    if(states=="NA"){
        return '<a href="/user/cancelOrder/'+id+'" class="main-btn">Cancel order</a>';
    }
})