const {body}=require('express-validator')
const User=require('../models/user')


exports.registerValidation=[
    body('email')
        .isEmail()
        .withMessage('Введіть коректний email')
        .custom(async(value,{req})=>{
            try{
                const user=await User.findOne({email:value})
                if(user){
                    return Promise.reject('Такий користувач вже зареєстрований')
                }
            }catch(e){
                console.log(e)
            }
        })
        .normalizeEmail(),
    body('password','Мінімальна довжина пароля повинна бути не менше ніж 6 символів ')
        .isLength({min:6,max:56})
        .isAlphanumeric()
        .trim(),
    body('confirm')
        .custom((value,{req})=>{
            if(value!==req.body.password){
                throw new Error('Пароль повинен співпадати')
            }
            return true;
        })
        .trim(),
    body('name')
        .isLength({min:3,max:20})
        .withMessage('Імя повинно бути мінімум 3 символа')
        .trim()

]

exports.courseValidator=[
    body('title','Введите корректное название').trim().isLength({min:3}),
    body('price').isNumeric().trim().withMessage('Введите корректную цену'),
    body('img').isURL().trim().withMessage('Введите корректний URL')
]