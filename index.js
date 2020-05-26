const path = require('path')
const csurf = require('csurf')
const flash = require('connect-flash')
const express = require('express')
const session = require('express-session')
const helmet = require('helmet')
const compression = require('compression')
const MongoStore = require('connect-mongodb-session')(session)
const Handlebars = require('handlebars')
const exphbs = require('express-handlebars')
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access')
const app = express()
const homeRouter = require('./routes/home')
const addRouter = require('./routes/add')
const coursesRouter = require('./routes/courses')
const cartRouter = require('./routes/cart')
const mongoose = require('mongoose')
const User = require('./models/user')
const ordersRouter = require('./routes/orders')
const profileRouter = require('./routes/profile')
const authRouter = require('./routes/auth')
const varMiddleWare = require('./middleware/variables')
const userMiddleWare = require('./middleware/user')
const fileMiddleWare = require('./middleware/file')
const keys = require('./keys')
const errorHandler = require('./middleware/error')

const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs',
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    helpers: require('./utils/hbs-helpers')
})

const store = new MongoStore({

    collection: 'sessions',
    uri: keys.MONGODB_URI
})


app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs');
app.set('views', 'views')

// Temporary user
// app.use(async (req, res, next)=>{
//     try{
//     const user = await User.findById('5ec8ec0a84a1e5251d595df7')
//     req.user = user
//     next()
//     } catch (e) {
//         console.log(e)
//     }

// })

app.use(express.static(path.join(__dirname, 'public')))
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use(express.urlencoded({ extended: true }))
app.use(session({
    secret: keys.SESSION_SECRETE,
    resave: false,
    saveUninitialized:false,
    store

}))
app.use(fileMiddleWare.single('avatar'))
app.use(csurf())
app.use(flash())
app.use(helmet())
app.use(compression())
app.use(varMiddleWare)
app.use(userMiddleWare)
app.use('/', homeRouter)
app.use('/add', addRouter)
app.use('/courses', coursesRouter)
app.use('/cart', cartRouter)
app.use('/orders', ordersRouter)
app.use('/auth', authRouter)
app.use('/profile', profileRouter)

app.use(errorHandler)


const PORT = process.env.PORT || 3000

async function start() {
    try {
        await mongoose.connect(keys.MONGODB_URI, {
            useNewUrlParser: true, useUnifiedTopology: true,
            useFindAndModify: false
        })

        // Temporary user
        // const candidate = await User.findOne()
        // if (!candidate) {
        //     const user = new User({
        //         email: 'sergey@mail.ru',
        //         name: 'Sergey',
        //         cart: { items: [] }
        //     })

        //     await user.save()
        // }
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`)
        })
    } catch (e) {
        console.log(e)
    }

}
start()



