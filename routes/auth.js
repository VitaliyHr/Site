const {Router}=require('express')
const User=require('../models/user')
const keys=require('../keys/index')
const {registerValidation}=require('../utils/validators')
const reqMail=require('../emails/register')
const resetMail=require('../emails/reset')
const crypto=require('crypto')
const nodemailer=require('nodemailer');
const bcrypt=require('bcryptjs');
const {validationResult}=require('express-validator')

const router=Router()

const transporter=nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: keys.MAIL_SENDER,
      pass: keys.MAIL_PASS
    }  
})


router.get('/login',async(req,res)=>{
    res.render('auth/login',{
        isLogin:true,
        title:"Авторизация",
        loginError:req.flash('loginError'),
        registerError:req.flash('registerError')
    })
})

router.post('/login',async(req,res)=>{
    try{

        const {email,password}=req.body
        const candidate=await User.findOne({email});
        
        if(!candidate){
            req.flash('loginError','Користувача не існує')
            return res.redirect('/auth/login#login')
        }else{
            const enhashedPs=await bcrypt.compare(password,candidate.password);
            if(enhashedPs)
            {
                req.session.user=candidate
                req.session.isAuthenticated=true;
                req.session.save((err)=>{
                if(err){
                    throw err
                }
                res.redirect('/');
        })
            }
            else{
                req.flash('loginError','Невірний пароль')
                return res.redirect('/auth/login#login')
            }
        }
    }catch(e){
        console.log(e)
    }
})

router.get('/logout',async(req,res)=>{
    req.session.destroy(()=>{
        res.redirect('/auth/login#login')
    })
})

router.post('/register',registerValidation, async(req,res)=>{
    try{
        const {name,email,password}=req.body
        const errors=validationResult(req);
        if(!errors.isEmpty()){
            req.flash('registerError',errors.array()[0].msg)
            return res.status(422).redirect('/auth/login#register')
        }

        const bcpassword=await bcrypt.hash(password,10);
       const user=new User({
                name,email,password:bcpassword,cart:{items:[]}
        })
        await user.save();
        res.redirect('/auth/login#login')
        transporter.sendMail(reqMail(email),(err,data)=>{
            if(err){
                console.log(err)
            }
        })
    }catch(e){
        console.log(e);
    }
})


router.get('/reset' ,(req,res)=>{
    res.render('auth/reset',{
        title:"Забули пароль",
        error:req.flash('error')
    })
})

router.post('/reset',(req,res)=>{
    try{
        crypto.randomBytes(32,async(err,buffer)=>{
            if(err){
                req.flash('error','Щось зламалось :( !!! Спробуйте пізніше!')
                return res.redirect('/auth/reset')
            }
            const token =buffer.toString('hex')
            const candidate=await User.findOne({email:req.body.email});
            if(candidate){
                candidate.resetToken =token;
                candidate.resetTokenExp=Date.now()+60*60*1000;
                await candidate.save()
                res.redirect('/auth/login')
                transporter.sendMail(resetMail(req.body.email,token),(err,body)=>{
                    if(err) console.log(err);
                })
            }else{
                req.flash('error',"Такого email не існує!")
                res.redirect('/auth/reset')
            }
        }) 
    }catch(e){
        console.log(e);
    }
})


router.get('/password/:token',async(req,res)=>{
    if(!req.params.token){
        return res.redirect('/auth/login')
    }
    try{
        const user=await User.findOne({
            resetToken:req.params.token,
            resetTokenExp:{$gt:Date.now()}
        })
        if(!user){
            return res.redirect('/auth/login')
        }
        res.render('auth/password',{
            title:"Восстановить доступ",
            error:req.flash('error'),
            userId:user._id.toString(),
            token:req.params.token,

        })
    }catch(e){
        console.log(e)
    }
})

router.post('/password',async(req,res)=>{
    if(!req.body.token){
        return res.redirect('/auth/login')
    }
    try{
        const user=await User.findOne({
            _id:req.body.userId,
            resetToken:req.body.token,
            resetTokenExp:{$gt:Date.now()}
        })
        if(user){
            user.password=await bcrypt.hash(req.body.password,10);
            user.resetToken=undefined
            user.resetTokenExp=undefined
            await user.save()
            res.redirect('/auth/login#login')
        }else{
            req.flash('LoginError','Час токена закінчився')
            res.redirect('/auth/login')
        }
    }catch(e){
        console.log(e)
    }
    
})


module.exports=router