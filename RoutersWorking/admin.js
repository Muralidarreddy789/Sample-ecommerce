const express=require('express');

const {body}=require('express-validator');

const path=require('path');

const addProucts=require('../Controllers/admin');

const isAuth=require('../middleware/is-Auth');

const router=express.Router();

router.get('/add-product',[body('title').isString().trim().isLength({min:5}).withMessage("Inavlid Value"),
body('price').isNumeric().trim().withMessage("Inavlid Value"),
body('description').isString().isLength({min:5}).trim().withMessage("Inavlid Value")],isAuth,addProucts.addProduct);

router.get('/products',isAuth,addProucts.adminProducts);

router.post('/add-product',
addProucts.postProduct);

router.get('/edit-product/:productId',isAuth,addProucts.editProduct);

router.post('/edit-product/:productId',[body('title').isString().trim().isLength({min:5}).withMessage("Inavlid Value"),
body('price').isNumeric().trim().withMessage("Inavlid Value"),
body('description').isString().isLength({min:5}).trim().withMessage("Inavlid Value")],addProucts.postEditProducts);

router.delete('/product/:prodId',addProucts.deleteProduct);

module.exports = router