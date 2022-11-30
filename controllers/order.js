const Order = require("../models/order")
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');



const order_id = () => {
    let result = 'VEND';
    let length = 4// Customize the length here.
    for (let i = length; i > 0; --i) {
        result += `${Math.floor(Math.random() * 10)}`
    }
    return result
}

const getAllOrders = catchAsync(async (req, res, next) => {
    const orders = await Order.find({ orderedBy: req.user.id })
    if (!orders) {
        return next(new AppError("You have no pending orders", 404))
    }
    res.status(200).json(orders)
});

const createOrder = catchAsync(async (req, res) => {

    req.body.orderedBy = req.user.id
    req.body.order_id = order_id();
    var delivery_fee = req.body.delivery_fee
    var pack_fee = req.body.pack_fee
    var arr = req.body.ordered_items;
    let sum = 0;

    for (let index = 0; index < arr.length; index++) {
      sum += arr[index].price;
    }

    sum += delivery_fee
    sum += pack_fee

    const order = await Order.create(req.body)

    order.total = sum
    order.save();

    res.status(201).json({ order })

    console.log(sum);
    console.log(order.total);

});

const getOrder = catchAsync(async (req, res, next) => {
    const singleOrder = await Order.findOne({ _id: req.params.id, orderedBy: req.user.id })

    if (!singleOrder) {
        return next(new AppError(`no task with id : ${req.params.id}`, 400))
    }
    res.status(200).json({ singleOrder })
});

const updateOrder =  catchAsync( async (req, res, next) => {
    const updateOrder = await Order.findOneAndUpdate({_id : req.params.id, orderedBy: req.user.id}, req.body, {
        new:true,
        runValidators : true
    });

    var delivery_fee = req.body.delivery_fee
    var pack_fee = req.body.pack_fee
    var arr = req.body.ordered_items;
    let sum = 0;

    for (let index = 0; index < arr.length; index++) {
      sum += arr[index].price;
    }

    sum += delivery_fee
    sum += pack_fee

    updateOrder.total = sum
    updateOrder.save();

    if (!updateOrder){
        return next(new AppError(`no order with id : ${req.params.id}`, 404))
    }
    res.status(200).json(updateOrder)
   
})

const deleteOrder =  catchAsync( async (req, res, next) => {
    const deleteOrder = await Order.findOneAndDelete({_id : req.params.id, orderedBy: req.user.id})

    if(!deleteOrder){
        return next(new AppError(`no order with id : ${req.params.id}`, 404))
    }
    res.status(200).json({ message: "Order deleted successfully!" })
})

module.exports = {
    getAllOrders,
    createOrder,
    getOrder,
    updateOrder,
    deleteOrder
}
