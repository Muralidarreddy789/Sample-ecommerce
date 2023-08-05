const express=require('express');

const app=express();

const path=require('path')

const parseBody=require('body-parser');

const user=require('./Routers/user');

const admin=require('./Routers/admin');

app.use(parseBody.urlencoded({extended:false}));

app.use(express.static(path.join(__dirname,'public')))

app.use(user);
app.use(admin);

app.listen(3000);
