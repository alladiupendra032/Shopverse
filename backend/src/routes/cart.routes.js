const express = require('express');
const router = express.Router();
const { getCart, addToCart, removeFromCart } = require('../controllers/cart.controller');

router.get('/',       getCart);
router.post('/',      addToCart);
router.delete('/:id', removeFromCart);

module.exports = router;
