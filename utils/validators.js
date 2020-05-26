const {body}=require('express-validator')
const User = require('../models/user')

exports.registerValidators = [
    body('email')
        .isEmail().withMessage('Введите корректный email')
        .custom(async (value, {req})=>{
        try {
            const user = await User.findOne({email:value})
            if (user) {
            return Promise.reject('Такой email уже занят')
            }
        }catch (e){
            console.log(escape)
        }
    })
    .normalizeEmail(),
    
    body('password', 'Пароль должен быть минимум 6 символов')
        .isLength({min:6, max: 56})
        .isAlphanumeric()
        .trim(),
    
    body('confirm')
        .custom((value, {req})=>{
        if (value!== req.body.password){
            throw new Error ('Пароли не совпадают')
        }
        return true
    })
        .trim(),

    body ('name')
        .isLength({min:3})
        .withMessage('Имя слишком короткое')
        .trim()

]


exports.courseValidators = [
    body('title').isLength({min:3}).withMessage('Название слишком короткое').trim(),
    body('price').isNumeric().withMessage('Введите корректную цену').trim(),
    body('img', 'Введите корректный URL картинки').isURL()
]