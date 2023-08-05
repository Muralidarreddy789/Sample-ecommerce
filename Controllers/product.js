const fs=require('fs');

const pdfkit=require('pdfkit');

const Products=require('../Models/poduct');

const User=require('../Models/user');

const Order=require('../Models/order');

const path=require('path');

const stripe=require('stripe')('sk_test_51NazuHSE32Zw7bNTn3KS3QBgTtCGvLhhtvuGGjshpGKNW3cOUjMcGrdOMYEGa05SB58ksEGeDlJnsvATEvyZ4MJ800RX5qf29x')

const ITEM_COUNT=6;

// const Cart=require('../Models/cart')


exports.getShop=(req,res,next)=>{
    const page=+req.query.page||1;
    let totalItems;
    // Products.find().then(products=>{
    //     res.render('shop/product-list',{prods:products,pageTitle:'shop',path:'/products',isAuthenicated:req.session.isLoggedIn,csrfToken:req.csrfToken(),current:page,nextPage:ITEM_COUNT*page<totalItems,previousPage:page>1,next:page+1,previous:page-1,lastPage:Math.ceil(totalItems/ITEM_COUNT)})
    // }).catch(err=>{
    //     console.log(err);
    // })
    Products.find().countDocuments().then(numProducts=>{
        totalItems=numProducts;
        return Products.find().skip((page-1)*ITEM_COUNT).limit(ITEM_COUNT); 
    })
    .then(products=>{
        res.render('shop/product-list',{prods:products,pageTitle:'shop',path:'/products',isAuthenicated:req.session.isLoggedIn,csrfToken:req.csrfToken(),current:page,nextPage:ITEM_COUNT*page<totalItems,previousPage:page>1,next:page+1,previous:page-1,lastPage:Math.ceil(totalItems/ITEM_COUNT)})
    }).catch(err=>{
        console.log(err);
    })
}

exports.getProduct=(req,res,next)=>{
    const prodsId=req.params.productId;
    Products.findById(prodsId).then((product)=>{
        console.log(product)
        res.render('shop/product-detail',{product:product,pageTitle:product.title,path:'/products',isAuthenicated:req.session.isLoggedIn})
    }).catch(err=>{
        console.log(err)
    })

}

exports.getIndex=(req,res,next)=>
{
    const page=+req.query.page||1;
    let totalItems;
    // console.log(req);
    Products.find().countDocuments().then(numProducts=>{
        totalItems=numProducts;
        return Products.find().skip((page-1)*ITEM_COUNT).limit(ITEM_COUNT); 
    })
    .then(products=>{
        res.render('shop/index',{prods:products,pageTitle:'shop',path:'/',isAuthenicated:req.session.isLoggedIn,csrfToken:req.csrfToken(),current:page,nextPage:ITEM_COUNT*page<totalItems,previousPage:page>1,next:page+1,previous:page-1,lastPage:Math.ceil(totalItems/ITEM_COUNT)})
    }).catch(err=>{
        console.log(err);
    })
}

exports.getCart=(req,res,next)=>{
    req.user.populate('cart.items.prodId').then(user=>{
            console.log(user.cart.items);
            const products=user.cart.items
            res.render('shop/cart',{Products:products,path:'/cart',pageTitle:"Cart",isAuthenicated:req.session.isLoggedIn})
        }).catch(err=>{
            console.log(err);
        })
    // Cart.getCart(cart=>{
    //     Products.fetchall(products=>{
    //         const cartProducts=[];
    //         for(let product of products)
    //         {
    //             const cartProductsData=cart.product.find(prod=>prod.id===product.id);
    //             if(cartProductsData)
    //             {
    //                 cartProducts.push({productData:product,qty:cartProductsData.qty});
    //             }
    //         }
    //         res.render('shop/cart',{Products:cartProducts,path:'/cart',pageTitle:"Cart"})
    //     });
    // });
}

exports.getPost=(req,res,next)=>{
    const id=req.body.productId;
    Products.findById(id).then(product=>{
        return req.user.addToCart(product)
    }).then(result=>{
        res.redirect('/cart')
    }).catch(err=>{
        console.log(err);
    });
    // let fetchedCart;
    // let product;
    // let newQuantity=1;
    // req.user.getCart().then(cart=>{
    //     fetchedCart=cart;
    //     return cart.getProducts({where:{id:id}}).then(products=>{
    //         if(products.length>0)
    //         {
    //             product=products[0];
    //         }
    //         if(product)
    //         {
    //             let oldQuantity=product.cartItem.qty;
    //             newQuantity=oldQuantity+1;
    //             return product;
    //         }
    //         return Products.findOne({where:{id:id}})
    //     }).then(product=>{
    //         return fetchedCart.addProduct(product,{through:{qty:newQuantity}});
    //     })
    // }).then(result=>{
    //     res.redirect('/cart')
    // }).catch(err=>{
    //     console.log(err);
    // })
}

exports.deleteCartItems=(req,res,next)=>{
    const prodid=req.body.id;
   req.user.deleteCartItems(prodid).then(result=>{
        res.redirect('/cart');
    }).catch(err=>{console.log(err)})
}

exports.postOrder=(req,res,next)=>{
   req.user.populate('cart.items.prodId').then(user=>{
        console.log(user.cart.items);
        const products=user.cart.items.map(i=>{
            return {product:{...i.prodId._doc},quantity:i.quantity}
        })
        const order=new Order({
            user:{
                email:req.user.email,
                userId:req.user
            },
            product:products
        })
    return order.save()
    })
    .then(result=>{
        return req.user.clearCart();
    }).then(result=>{
        res.redirect('/orders')
    }).catch(err=>console.log(err));
}

exports.getcheckout=(req,res,next)=>{
    let products;
    let totalPrice;
    req.user.populate('cart.items.prodId').then(user=>{
        console.log(user.cart.items);
        totalPrice=0;
        products=user.cart.items
        products.forEach(p=>{
            totalPrice+=p.quantity*p.prodId.price;
        })

        let arrayOfProducts=products.map(p => {
            return {
              price_data: {
                currency: 'usd',
                unit_amount: p.prodId.price * 100, // Price per unit in cents
                product_data: {
                  name: p.prodId.title,
                  description: p.prodId.description,
                },
              },
              quantity: p.quantity
            };
        });

        console.log(arrayOfProducts);
        return stripe.checkout.sessions.create({
            payment_method_types:['card'],
            mode:'payment',
            line_items:arrayOfProducts,
            success_url:req.protocol+'://'+req.get('host')+'/'+'checkout/success',
            cancel_url:req.protocol+'://'+req.get('host')+'/'+'checkout/cancel'
        })
    }).then(session=>{
        res.render('shop/checkout',{Products:products,path:'/Checkout',pageTitle:"Checkout",isAuthenicated:req.session.isLoggedIn,totalPrice:totalPrice,sessionId:session.id})
    }).catch(err=>{
        console.log(err);
    })
}

exports.getOrders=(req,res,next)=>{
    Order.find({'user.userId':req.user._id}).then(orders=>{
        res.render('shop/orders',{path:'/orders',pageTitle:'Orders',orders:orders,isAuthenicated:req.session.isLoggedIn});
    }).catch(err=>{
        const error=new Error(err);
        error.httpStatusCode=500;
        return next(err);
    })
}

exports.getInvoice=(req,res,next)=>{
    const orderId=req.params.orderId;
    const invoiceName='invoice-'+orderId+'.pdf';
    const way=path.join('data','invoice',invoiceName);
    Order.findById(orderId).then(order=>{
        const doc=new pdfkit();
        doc.pipe(fs.createWriteStream(way));
        res.setHeader('Content-Type','application/pdf');
        res.setHeader('Content-Depostion','attachment; filename"'+invoiceName +'"');
        doc.pipe(res);
        doc.fontSize(26).text('Invoice',{underline:true});
        doc.text('---------------------------------------');
        let totalPrice=0;
        order.product.forEach(prod => {
            totalPrice+=prod.quantity * prod.product.price;
            doc.fontSize(16).text(prod.product.title +'-' + prod.quantity);
        });
        doc.text('------------------------------------------');
        doc.fontSize(20).text(totalPrice);
        doc.end();
    })
    // fs.readFile(path.join('data','invoice',invoiceName),(err,data)=>{
    //     if(err)
    //     {
    //         return next(err);
    //     }
    //     res.setHeader('Content-Type','application/pdf');
    //     res.setHeader('Content-Disposition','attachment; filename"'+invoiceName +'"');
    //     res.send(data)

    //})
    // const file=fs.createReadStream(way);
}
