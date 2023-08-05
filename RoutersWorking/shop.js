const express=require('express');

const path=require('path');

const displayShop=require('../Controllers/product');

const isAuth=require('../middleware/is-Auth');

const router =express.Router();

router.get('/',displayShop.getIndex);

router.get('/products',displayShop.getShop);

router.get('/cart',isAuth,displayShop.getCart);

router.post('/cart',displayShop.getPost);

router.get('/checkout',displayShop.getcheckout);

router.get('/product/:productId',displayShop.getProduct);

router.get('/orders',isAuth,displayShop.getOrders);

router.get('/checkout/success',isAuth,displayShop.postOrder);

router.get('/checkout/cancel',displayShop.getcheckout);

router.post('/delete-item-cart',displayShop.deleteCartItems);

router.get('/invoice/:orderId',isAuth,displayShop.getInvoice);

module.exports=router
