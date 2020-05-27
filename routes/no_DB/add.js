const { Router } = require('express')
const router = Router()
const Course = require ('../models/course')

router.get('/', (req, res) => {
    res.render('add', {
        title: 'Добавить товар',
        isAdd: true
    })

})

router.post('/', async (req, res) => {

    res.redirect('/courses')
    course = new Course(req.body.title, req.body.price, req.body.img)

    await course.save()

})




module.exports = router