//importing additional libraries
const path=require('path');

const express=require('express');

const parseBody=require('body-parser');

const pug=require('pug');

const mongoose=require('mongoose');

const session=require('express-session');

const MongoDBStore=require('connect-mongodb-session')(session);

const csrf=require('csurf');

const flash=require('connect-flash');



//importing modules
const adminRouters=require('./RoutersWorking/admin');

const shopRouters=require('./RoutersWorking/shop');

const pageNotFound=require('./Controllers/404');

const authRouter=require('./RoutersWorking/auth');

require('dotenv').config()
const User=require('./Models/user');

//main body

const app=express();

const multer=require('multer');

const fileStorage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'images');
    },
    filename:(req,file,cb)=>{
        cb(null,Date.now().toString()+'-'+file.originalname);
    }
})

const upload=multer({
    storage:fileStorage,
});


const csrfProtection=csrf();


app.use(parseBody.urlencoded({extended:false}));

app.use(upload.single('image'))

app.use(express.static(path.join(__dirname,'public')));

app.use("/images",express.static(path.join(__dirname,'images')));

const store=new MongoDBStore({
    uri:process.env.MONGO_URL,
    collection:'session'
})

app.use(
    session({secret:'this-is-a-secret',resave:false,saveUninitialized:false,store:store})
);

app.use(csrfProtection);

app.use(flash());

app.set('view engine','pug');
app.set('views','view');

app.use((req,res,next)=>{
    if(!req.session.user)
    {
       return  next();
    }

        User.findById(req.session.user._id)
        .then(result=>{
            if(!result)
            {
                return next();
            }
            req.user=result;
            next();
        })
        .catch(err=>
        {
           throw new Error(err);
        })
    
})

app.use((req,res,next)=>{
    res.locals.isAuthenticated=req.session.isLoggedIn;
    res.locals.csrfToken=req.csrfToken();
    next();
})
app.use('/admin',adminRouters);
app.use(shopRouters);
app.use(authRouter);

// app.get('/500',pageNotFound.connectionIssues);

// app.use(pageNotFound.pagenotfound);

// app.use((error,req,res,next)=>{
//     res.redirect('/500');
// })

mongoose.connect(process.env.MONGO_URL).then(result=>{
    app.listen(process.env.PORT);
}).catch(err=>{
    console.log(err);
})

