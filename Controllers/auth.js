const User=require('../Models/user');

const nodemailer=require('nodemailer');

const bcrypt=require('bcryptjs');

const crypto=require('crypto');

const { validationResult } = require('express-validator');

//adding configuration to node mailer

const transport=nodemailer.createTransport({
    host: 'smtp-relay.sendinblue.com',
    port: 587,
    auth: {
        user: 'muralidarreddychada@gmail.com',
        pass: 'WpBfVMCxvSA58Hqk'
    }
})

exports.getLogin=(req,res,next)=>{
    console.log(req.session.isLoggedIn);
    res.render('auth/login',{path:'/login',pageTitle:'Login',isAuthenicated:false,errorMessage:""});

}
 exports.postLogin=(req,res,next)=>{
    const error=validationResult(req)
    console.log(error);
    if(!error.isEmpty())
    {
        res.status(422).render('auth/login',{path:'/login',pageTitle:'Login',isAuthenicated:false,errorMessage:error.array()[0].msg});
    }
    else{
        req.session.isLoggedIn=true;
        res.redirect('/');
    }
 }

 exports.postLogout=(req,res,next)=>{
    req.session.destroy((err)=>{
        console.log(err);
        res.redirect('/');
    })
 }

exports.getSignup=(req,res,next)=>{
    res.render('auth/signup',{path:'/SignUp',pageTitle:'SignUp',isAuthenicated:false,errorMessage:'',oldInput:{email:'',password:'',confirmPassword:''}})
 }

 exports.postSignup=(req,res,next)=>{
    const email=req.body.email;
    const password=req.body.password;
    const error=validationResult(req);
    if(!error.isEmpty())
    {
        console.log(error.array());
        return res.status(422).render('auth/signup',{path:'/SignUp',pageTitle:'SignUp',isAuthenicated:false,errorMessage:error.array()[0].msg,oldInput:{email:email,password:password,confirmPassword:req.body.password}})
    }
        bcrypt.hash(password,12).then(password=>{
            const user=new User({email:email,password:password,cart:{items:[]}});
            return user.save();
        }).then(result=>{
                res.redirect('/login')
                return transport.sendMail({
                to:email,
                from:'"shop@gmail.com" <murali@gmail.com>',
                subject:'SignUp Succesfull',
                text:'hello',
                html:'<h1>your account has been created succesfully</h1>'
            })
        }).then(result=>{
            console.log(result);
        }).catch((err)=>{
            const error=new Error(err);
            error.httpStatusCode=500;
            return next(err);
        })
 };
 
 exports.getResetPswd=(req,res,next)=>{
    res.render('auth/reset',{path:'/reset-password',pageTitle:'reset',isAuthenicated:false,errorMessage:req.flash('error')});
 }

 exports.postReset=(req,res,next)=>{
    crypto.randomBytes(32,(err,buffer)=>{
        if(err)
        {
            console.log(err);
            res.redirect('/reset-password');
        }
        const token=buffer.toString('hex');
        User.findOne({email:req.body.email}).then(user=>{
            if(!user)
            {
                req.flash('error','no user with that email exisist');
                return res.redirect('/reset-password');
            }
            user.resetToken=token;
            user.restExpire=Date.now()+3600000;
            return user.save().then(result=>{
                    res.redirect('/');
                    transport.sendMail({
                    to:req.body.email,
                    from:'"shop@gmail.com" <murali@gmail.com>',
                    subject:'rest Password',
                    html:`
                        <p>your account has been created succesfully<p>
                        <p>Click this <a href="http://localhost:3000/reset-password/${token}">link</a> to set a new Password</p>
                    `
                 });
            })
        }).catch(err=>{
            const error=new Error(err);
            error.httpStatusCode=500;
            return next(err);
        })
    })
    
 }

 exports.getNewpassword=(req,res,next)=>{
    const token=req.params.token;
    User.findOne({resetToken:token,restExpire:{$gt:Date.now()}}).then(user=>{
        res.render('auth/new-password',{path:'/new-password',pageTitle:'New Password',isAuthenicated:false,errorMessage:req.flash('error'),UserId:user._id.toString(),token:token});
    }).catch(err=>{
        const error=new Error(err);
        error.httpStatusCode=500;
        return next(err);
    })
 }

 exports.postNewpassword=(req,res,next)=>{
    const userid=req.body.userid;
    const token=req.body.token;
    let resuser;
    User.findOne({_id:userid,resetToken:token,restExpire:{$gt:Date.now()}}).then(user=>{
        resuser=user;
        return bcrypt.hash(req.body.password,12);
    }).then(hashedPassword=>{
        resuser.password=hashedPassword;
        resuser.resetToken=undefined;
        resuser.restExpire=undefined;
        return resuser.save();
    }).then(result=>{
        res.redirect('/login');
    }).catch(err=>{
        const error=new Error(err);
        error.httpStatusCode=500;
        return next(err);
    })

 }
