const { Router } = require('express')
const router = Router()
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const { validationResult } = require('express-validator')
const { registerValidators } = require('../utils/validators')
const nodemailer = require('nodemailer')
const sendGrid = require('nodemailer-sendgrid-transport')
const keys = require('../keys')
const regEmail = require('../emails/registration')
const recoveryEmail = require('../emails/reset')

const transporter = nodemailer.createTransport(sendGrid({
    auth: { api_key: keys.SEND_GRID }
}))

router.get('/login', (req, res) => {

    res.render('auth/login', {
        isLogin: true,
        title: 'Авторизация',
        regError: req.flash('reg-error'),
        logError: req.flash('log-error'),
        success: req.flash('success')

    })
})

router.get('/logout', async (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login#login')
    })


})

router.post('/login', async (req, res) => {

    try {
        const { email, password } = req.body
        const candidate = await User.findOne({ email })

        if (candidate) {
            const areSame = await bcrypt.compare(password, candidate.password)
            if (areSame) {

                req.session.user = candidate
                req.session.isAuthenticated = true
                req.session.save((err) => {
                    if (err) {
                        throw err
                    } else {
                        res.redirect('/')
                    }
                })


            } else {
                await req.flash('log-error', 'Неверный email или пароль')
                res.redirect('/auth/login#login')
            }
        } else {
            await req.flash('log-error', "Такого пользователя не существует")
            res.redirect('/auth/login#login')
        }

    } catch (e) {
        console.log(e)
    }

})

router.post('/register', registerValidators, async (req, res) => {
    try {
        const { name, email, password } = req.body

        const errors = validationResult(req)
        
        if (!errors.isEmpty()) {
            req.flash('reg-error', errors.array()[0].msg)
            return res.status(422).redirect('/auth/login#register')
        }

        const hashPassword = await bcrypt.hash(password, 10)
        const user = new User({
            email, name, password: hashPassword, cart: { items: [] }
        })

        await user.save()
        await req.flash('success', 'Аккаунт успешно создан')
        res.redirect('/auth/login#login')
        await transporter.sendMail(regEmail(email, name))


    } catch (e) {
        console.log(e)
    }
})

router.get('/reset', (req, res) => {

    res.render('auth/reset', {
        title: 'Сброс пароля',
        error: req.flash('error')
    })
})


router.post('/reset', (req, res) => {
    try {
        crypto.randomBytes(32, async (err, buffer) => {
            if (err) {
                req.flash('error', 'Что-то пошло не так, повторите попытку позже... ')
                return res.redirect('/auth/reset')
            }

            const token = buffer.toString('hex')

            const candidate = await User.findOne({ email: req.body.email })

            if (candidate) {
                candidate.resetToken = token
                candidate.resetTokenExp = Date.now() + 60 * 60 * 1000
                await candidate.save()
                await transporter.sendMail(recoveryEmail(candidate.email, token))
                res.redirect('/auth/login')



            } else {
                req.flash('error', 'Такого пользователя не существует')
                res.redirect('/auth/reset')
            }

        })

    } catch (e) {
        console.log(e)
    }

})

router.get('/password/:token', async (req, res) => {

    if (!req.params.token) {
        req.flash('log-error', 'Время жизни ссылки истекло')
        return res.redirect('/auth/login')

    }

    try {
        const user = await User.findOne({
            resetToken: req.params.token,
            resetTokenExp: { $gt: Date.now() }

        })

        if (!user) {
            req.flash('log-error', 'Время жизни ссылки истекло')
            res.redirect('/auth/login')


        } else {
            res.render('auth/password', {
                title: 'Новый пароль',
                error: req.flash('error'),
                userId: user._id.toString(),
                token: req.params.token
            })

        }


    } catch (e) {
        console.log(e)
    }

})

router.post('/password', async (req, res) => {

    try {
        const user = await User.findOne({
            _id: req.body.userId,
            resetToken: req.body.token,
            resetTokenExp: { $gt: Date.now() }
        })

        if (user) {
            user.password = await bcrypt.hash(req.body.password, 10)
            user.resetToken = undefined
            user.resetTokenExp = undefined
            await user.save()
            await req.flash('success', 'Пароль успешно изменен')
            res.redirect('/auth/login')


        } else {
            req.flash('logError', 'Время жизни ссылки истекло')
            res.redirect('/auth/login')
        }

    } catch (e) {
        console.log(e)
    }

})

module.exports = router