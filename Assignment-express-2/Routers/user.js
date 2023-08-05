const path=require('path')

const express=require('express');

const router=express.Router();

router.get('/user',(req,res,next)=>{
    res.sendFile(path.join(__dirname,'..','view','user.html'));
});

router.post('/users',(req,res,next)=>{
    console.log(req.body);
    res.redirect('/');
});

module.exports=router;
