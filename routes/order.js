const express = require('express');
const router = express.Router();

const { protect } = require('../controllers/user')

const {
    getAllOrders,
    getOrder,
    createOrder,
    updateOrder,
    deleteOrder,
    getByOrderId

} = require('../controllers/order')

router.route('/').post(protect, createOrder).get(protect, getAllOrders);
router.route('/:id').get(protect, getOrder).patch(protect,updateOrder).delete(protect,deleteOrder);

module.exports = router

