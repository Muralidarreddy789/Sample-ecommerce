const express=require('express');

const auth=require('../Controllers/auth');

const {check,body}=require('express-validator');

const bcrypt=require('bcryptjs');

const User=require('../Models/user');

let global;
const router=express.Router();

router.get('/login',auth.getLogin);

router.post('/login',check('email').isEmail().withMessage('enter a valid mail').custom((value,{req})=>{
    return User.findOne({email:value}).then(user=>{
        if(!user)
        {
            return Promise.reject('no user exisist with that Email');
        }
        global=user;
    })
}),body('password').custom((value,{req})=>{
   return bcrypt.compare(value,global.password).then(isMatch=>{
    if(!isMatch)
    {
        return Promise.reject("Invalid Password or Email");
    }
    req.session.user=global;
   })
}),auth.postLogin);

router.post('/logout',auth.postLogout);

router.get('/SignUp',auth.getSignup);

router.post('/SignUp',check('email').isEmail().withMessage('Please enter a valid email').normalizeEmail().custom((value,{req})=>{
    return User.findOne({email:value}).then(userdoc=>{
        if(userdoc)
        {
           return Promise.reject("User already exisist")
        }
})

}),
body('password','pasword should be of atleast length 4 and Alphanumeric').isLength({min:5}).isAlphanumeric().trim(),
body('confirmPassword').trim().custom((value,{req})=>{
    if(value!==req.body.password)
    {
        throw new Error("Passwords have to match");
    }
    return true;
}),
auth.postSignup);

router.get('/reset-password',auth.getResetPswd);

router.post('/reset-password',auth.postReset);

router.get('/reset-password/:token',auth.getNewpassword);

router.post('/new-password',auth.postNewpassword);

module.exports=router;