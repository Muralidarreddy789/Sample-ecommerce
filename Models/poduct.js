const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const productSchema=new Schema({
    title:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    imageurl:{
        type:String,
        required:true
    },
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
})

module.exports=mongoose.model('Product',productSchema)











// const getdb=require('../util/database').getdb;

// const ObjectId=require('mongodb').ObjectId;

// const Product=class{
//     constructor(title,price,description,imageurl,userid)
//     {
//         this.title=title;
//         this.price=price;
//         this.description=description;
//         this.imageurl=imageurl;
//         this.userid=userid;
//     }
//     save()
//     {
//         const db=getdb();
//         return db.collection('product').insertOne(this).then(result=>{
//             console.log(result)
//         }).catch(err=>{
//             console.log(err);
//         });
//     }
//     update(id)
//     {
//         const db=getdb();
//         const prodId=new ObjectId(id);
//         return db.collection('product').updateOne({_id:prodId},{$set:this})
//     }
//     static fetchAll()
//     {
//         const db=getdb();
//         return db.collection('product').find().toArray();
//     }
//     static findProduct(id)
//     {
//         const db=getdb();
//         const prodId=new ObjectId(id);
//         return db.collection('product').find({_id:prodId}).toArray();
//     }
//     static deleteProduct(id)
//     {
//         const db=getdb();
//         const prodId=new ObjectId(id);
//         return db.collection('product').findOneAndDelete({_id:prodId});
//     }

// }



// module.exports=Product;