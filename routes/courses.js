const { Router } = require('express')
const Course = require('../models/course')
const auth = require('../middleware/auth')
const router = Router()
const { courseValidators } = require('../utils/validators')
const { validationResult } = require('express-validator')

const isOwner = function (course, req) {

    return course.userId.toString() === req.user._id.toString()

}

router.get('/', async (req, res) => {

    try {

        const courses = await Course.find().populate('userId', 'email name')

        res.render('courses', {
            title: 'Товары',
            isCourses: true,
            userId: req.user ? req.user._id.toString() : null,
            courses,
            user: req.user ? req.user.toObject():null
        })
    } catch (e) {
        console.log(e)
    }
})

router.get('/:id/edit', auth, async (req, res) => {
    if (!req.query.allow) {
        return res.redirect('/')
    }
    try {
        const course = await Course.findById(req.params.id)

        if (!isOwner(course, req)) {
            return res.redirect('/courses')
        }

        res.render('course-edit', {
            title: `Редактировать ${course.title}`,
            error: req.flash('error'),
            course,
            user: req.user ? req.user.toObject():null
        })
    } catch (e) {
        console.log(e)
    }
})

router.post('/edit', auth, courseValidators, async (req, res) => {
    const { id } = req.body
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        req.flash('error', errors.array()[0].msg)
        return res.status(422).redirect(`/courses/${id}/edit?allow=true`)

    }

    try {
        delete req.body.id
        const course = await Course.findById(id)

        if (!isOwner(course, req)) {
            return res.redirect('/courses')
        }

        Object.assign(course, req.body)
        await course.save()
        res.redirect('/courses')

    } catch (e) {
        console.log(e)
    }


})

router.post('/remove', auth, async (req, res) => {
    try {
        await Course.deleteOne({
            _id: req.body.id,
            userId: req.user._id
        })
        res.redirect('/courses')
    } catch (e) {
        console.log(e)
    }

})

router.get('/:id', async (req, res) => {
    try {

        const course = await Course.findById(req.params.id)
        res.render('course', {
            layout: 'empty',
            title: `Товар ${course.title}`,
            course
        })

    } catch (e) {
        console.log(e)
    }
})

module.exports = router