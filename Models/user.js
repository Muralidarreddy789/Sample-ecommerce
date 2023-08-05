const mongoose=require('mongoose');
const { DATE } = require('sequelize');
const Schema=mongoose.Schema;

const userSchema=new Schema({
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    resetToken:String,
    restExpire:Date,
    cart:{
        items:[
            {
                prodId:{type:Schema.Types.ObjectId,ref:'Product',required:true},
                quantity:{type:Number,required:true}
            }
        ]
    }
})

userSchema.methods.addToCart=function(product){
    const cartProduct=this.cart.items.findIndex(cp=>{
            console.log(cp.prodId);
            return cp.prodId.toString() == product._id.toString();
        })
        console.log(cartProduct);
        const upateProductList=[...this.cart.items];
        let newQuantity=1;
        if(cartProduct>=0)
        {
            newQuantity=upateProductList[cartProduct].quantity+1;
            upateProductList[cartProduct].quantity=newQuantity;
        }
        else
        {
            upateProductList.push({prodId:product._id,quantity:1})
        }
        const updatedCart={ items:upateProductList};
        this.cart=updatedCart;
        return this.save();
}

userSchema.methods.deleteCartItems=function(id)
{
    const updatedList=[...this.cart.items];
    const newList=updatedList.filter(item=>{
        return item.prodId.toString() !== id.toString()
    })
    this.cart.items=newList;
    return this.save();
}

userSchema.methods.clearCart=function()
{
    this.cart={items:[]};
    return this.save();
}

module.exports=mongoose.model('User',userSchema);
















// const getdb=require('../util/database').getdb;
// const ObjectId=require('mongodb').ObjectId;

// const User=class{
//     constructor(username,email,cart,id)
//     {
//         this.username=username;
//         this.email=email;
//         this.cart=cart;
//         this._id=id;
//     }
//     save()
//     {
//         const db=getdb();
//         return db.collection('users').insertOne(this).then(result=>{
//             console.log(result);
//         }).catch(err=>{
//             console.log(err);
//         })
//     }
//     addToCart(product)
//     {
//         const cartProduct=this.cart.items.findIndex(cp=>{
//             console.log(cp.productId);
//             return cp.productId.toString() == product._id.toString();
//         })
//         console.log(cartProduct);
//         const upateProductList=[...this.cart.items];
//         let newQuantity=1;
//         if(cartProduct>=0)
//         {
//             newQuantity=upateProductList[cartProduct].quantity+1;
//             upateProductList[cartProduct].quantity=newQuantity;
//         }
//         else
//         {
//             upateProductList.push({productId:new ObjectId(product._id),quantity:1})
//         }
//         const updatedCart={ items:upateProductList};
//         const db=getdb();
//         return db.collection('users').updateOne({_id:new ObjectId(this._id)},{$set:{cart:updatedCart}});
//     }
//     getCart()
//     {
//        const db=getdb();
//        const productIds=this.cart.items.map(i=>{
//         return i.productId;
//        })
//        return db.collection('product').find({_id:{$in:productIds}}).toArray().then(products=>{
//         return products.map(p=>{
//             return {...p,quantity:this.cart.items.find(i=>{
//                 return p._id.toString()===i.productId.toString();
//             }).quantity}
//         })
//        })
//     }
//     deleteCartItems(id)
//     {
//         const updatedList=[...this.cart.items];
//         const prodId=new ObjectId(id);
//         const newList=updatedList.filter(item=>{
//             return item.productId.toString() !== prodId.toString()
//         })
//         const updatedCart={ items:newList};
//         const db=getdb();
//         return db.collection('users').updateOne({_id:new ObjectId(this._id)},{$set:{cart:updatedCart}});

//     }
//     orderItems()
//     {
//         const db=getdb();
//         return this.getCart().then(products=>{
//             const order={
//                 items:products,
//                 user:{
//                     _id:new ObjectId(this._id),
//                     name:this.name
//                 }
//             }
//             return db.collection('orders').insertOne(order)
//         })
//         .then(resulr=>{
//             this.cart={items:[]};
//             return db.collection('users').updateOne({_id:new ObjectId(this._id)},{$set:{cart:{items:[]}}})
//         })
//     }
//     getOrder()
//     {
//         const db=getdb();
//         return db.collection('orders').find({'user._id':new ObjectId(this._id)}).toArray();

//     }
//     static findById(id)
//     {
//         const prodId=new ObjectId(id);
//         const db=getdb()
//         return db.collection('users').find({_id:prodId}).next();
//     }
// }
// module.exports=User;