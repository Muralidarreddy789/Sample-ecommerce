const Products=require('../Models/poduct');

const ObjectId=require('mongoose')

const fileHelper=require('../util/file-helper');

const{validationResult}=require('express-validator');
const { file } = require('pdfkit');

exports.addProduct= (req,res,next)=>{
    res.render('admin/edit-product',{pageTitle:'add-product',path:'/admin/add-product',editing:false,isAuthenicated:req.session.isLoggedIn,product:{title:'',imageurl:'',price:'',description:''},errorMessage:'',error:false})
}

exports.postProduct=(req,res,next)=>{

    const title=req.body.title;
    const image=req.file;
    const description=req.body.description;
    const price=req.body.price;
    const error=validationResult(req);
    console.log(image);
    if(!image)
    {
        return res.status(422).render('admin/edit-product',{pageTitle:'add-product',path:'/admin/add-product',editing:false,isAuthenicated:req.session.isLoggedIn,product:{title:title,price:price,description:description},errorMessage:"upload an image",error:true,})
    }
    if(!error.isEmpty())
    {
        return res.status(422).render('admin/edit-product',{pageTitle:'add-product',path:'/admin/add-product',editing:false,isAuthenicated:req.session.isLoggedIn,product:{title:title,imageurl:imageurl,price:price,description:description},errorMessage:error.array()[0].msg,error:true})
    }
    const imageurl=image.path;
    const product=new Products({
        // _id:new mongoose.Types.ObjectId('64b844a7a4bf9a87908e3127'),
        title:title,
        price:price,
        description:description,
        imageurl:imageurl,
        userId:req.user._id
    });
    product.save().then(result=>{
        console.log(result);
        console.log('created product');
        res.redirect('/admin/products')
    }).catch(err=>{
        // return res.status(500).render('admin/edit-product',{pageTitle:'add-product',path:'/admin/add-product',editing:false,isAuthenicated:req.session.isLoggedIn,product:{title:title,imageurl:imageurl,price:price,description:description},errorMessage:'Database connection error',error:true})
        // res.redirect('/500');
        const error=new Error(err);
        error.httpStatusCode=500;
        return next(err);
    });
}

exports.editProduct= (req,res,next)=>{
    const editMode=req.query.edit;
    if(!editMode)
    {
        return res.redirect('/')
    }
    const id=req.params.productId;
    Products.findById(id).then(product=>{res.render('admin/edit-product',{pageTitle:'edit-product',path:'/admin/edit-product',editing:editMode,product:product,isAuthenicated:req.session.isLoggedIn,errorMessage:'',error:true})})
    .catch(err=>{
        const error=new Error(err);
        error.httpStatusCode=500;
        return next(err);
    })
}

exports.postEditProducts=(req,res,next)=>
{
    const id=req.params.productId;
    const title=req.body.title;
    const image=req.file;
    const description=req.body.description;
    const price=req.body.price;
    const error=validationResult(req);
    if(!error.isEmpty())
    {
        return res.status(422).render('admin/edit-product',{pageTitle:'add-product',path:'/admin/add-product',editing:false,isAuthenicated:req.session.isLoggedIn,product:{title:title,price:price,description:description},errorMessage:error.array()[0].msg,error:true,_id:id})
    }
    Products.findById(id).then(product=>{
        product.title=title;
        product.description=description;
        product.price=price;
        if(image)
        {
            fileHelper(product.imageurl);
            product.imageurl=image.path;
        }
        return product.save();
    }).then(result=>{
        res.redirect('/admin/products')
    }).catch(err=>{
        const error=new Error(err);
        error.httpStatusCode=500;
        return next(err);
    });
}

exports.adminProducts=(req,res,next)=>
{
    Products.find({userId:req.user._id}).then(products=>{
        res.render('admin/products',{prods:products,pageTitle:'shop',path:'/admin/products',isAuthenicated:req.session.isLoggedIn})
    }).catch(err=>{
        const error=new Error(err);
        error.httpStatusCode=500;
        return next(err);
    });

}

exports.deleteProduct=(req,res,next)=>
{
    const id=req.params.prodId;
    Products.findById(id).then(product=>{
        fileHelper(product.imageurl);
        return Products.findByIdAndDelete(id);
    })
    .then(re=>{
        res.json({message:"operation Succesful"})
    }).catch(err=>{
        res.json({message:'failed to delete the file'})
    });
}
