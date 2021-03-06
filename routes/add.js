const { Router } = require('express')
const router = Router()
const Course = require('../models/course')
const auth = require('../middleware/auth')
const { courseValidators } = require('../utils/validators')
const { validationResult } = require('express-validator')

router.get('/', auth, (req, res) => {
    res.render('add', {
        title: 'Добавить товар',
        isAdd: true,
        user: req.user ? req.user.toObject():null
    })

})

router.post('/', auth, courseValidators, async (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(422).render('add', {
            title: 'Добавить товар',
            isAdd: true,
            error: errors.array()[0].msg,
            data: {
                title: req.body.title,
                price: req.body.price,
                img: req.body.img,
                user: req.user.toObject()
                
            }
        })

    }

    const course = new Course({
        title: req.body.title,
        price: req.body.price,
        img: req.body.img,
        userId: req.user
    })



    try {
        await course.save()
        res.redirect('/courses')
    } catch (e) {
        console.log(e)
    }


})




module.exports = router