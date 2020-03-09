const express = require('express')
const path = require('path')
const helmet=require('helmet')
const compression=require('compression')
const flash=require('connect-flash')
const servFavicon=require('serve-favicon')
const mongoose = require('mongoose')
const exphbs = require('express-handlebars')
const session=require('express-session')
const csrf=require('csurf')
const sessionStore=require('connect-mongodb-session')({session})
const homeRoutes = require('./routes/home')
const cardRoutes = require('./routes/card')
const addRoutes = require('./routes/add')
const coursesRoutes = require('./routes/courses')
const ordersRoutes=require('./routes/orders')
const authRoutes=require('./routes/auth')
const profileRoutes=require('./routes/profile')
const varMiddleware=require('./middleware/various')
const userMiddleware=require('./middleware/user')
const multerMiddleware=require('./middleware/file')
const keys=require('./keys/index')
const errorPage=require('./middleware/error')


const app = express()


const store=new sessionStore({
  collection:"sessions",
  uri:keys.MONGODB_URI
})

const hbs = exphbs.create({
  defaultLayout: 'main',
  extname: 'hbs',
  helpers:require('./utils/hbs-helper')
})


app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')

app.use(express.static(path.join(__dirname, 'public')))
app.use('/images',express.static(path.join(__dirname,'images')))
app.use(express.urlencoded({extended: true}))
app.use(session({
  resave:false,
  saveUninitialized:false,
  secret:keys.SESSION_SECRET,
  store
}))
app.use(multerMiddleware.single('avatar'))
app.use(csrf())
app.use(helmet())
app.use(compression())
app.use(flash())
app.use(servFavicon(path.join('public','favicon.ico')))

app.disable('x-powered-by')

app.use(userMiddleware)
app.use(varMiddleware);



app.use('/', homeRoutes)
app.use('/add', addRoutes)
app.use('/courses', coursesRoutes)
app.use('/card', cardRoutes)
app.use('/orders',ordersRoutes)
app.use('/auth',authRoutes)
app.use('/profile',profileRoutes)

app.use(errorPage);

const PORT = process.env.PORT || 3000

async function start() {
  try {
    await mongoose.connect(keys.MONGODB_URI, {
      useNewUrlParser: true,
      useFindAndModify:false,
      useUnifiedTopology:true
    })
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  } catch (e) {
    console.log(e)
  }
}
start()