const {Router} = require('express')
const Course = require('../models/course')
const auth= require('../middleware/auth')
const {courseValidator}=require('../utils/validators')
const {validationResult}=require('express-validator')
const router = Router()


function isOwn(course,req){
  return course.userId==req.user._id.toString()
}


router.get('/', async (req, res) => {
  try{
    const courses = await Course.find()
    .populate('userId', 'email name')
    .select('price title img')

    res.render('courses', {
      title: 'Курсы',
      isCourses: true,
      courses,
      userId:req.user?req.user._id.toString() : null
  })
  }catch(e){
    console.log(e);
  }
})

router.get('/:id/edit',auth, async (req, res) => {
  if (!req.query.allow) {
    return res.redirect('/')
  }
  try{
    const course = await Course.findById(req.params.id)
    if(isOwn(course,req)){
      res.render('course-edit', {
        title: `Редактировать ${course.title}`,
        course
    })
  }
  else{
    return res.redirect('/courses')
  }
  }catch(e){
    console.log(e)
  }
})

router.post('/edit',auth,courseValidator, async (req, res) => {
  try{
    const errors=validationResult(req)

    const {id}=req.body

    if(!errors.isEmpty()){
      return res.status(422).redirect(`/courses/${id}/edit?allow=true`)
    }
    delete req.body.id
    const course=await Course.findById(id)
    if(isOwn(course,req)){
      Object.assign(course,req.body)
      await course.save()
      res.redirect('/courses')
    }else{
      return res.redirect('/courses')
    }
  }catch(e){
    console.log(e)
  }
})

router.post('/remove',auth, async (req, res) => {
  try {
    await Course.deleteOne({
      _id: req.body.id,
      userId:req.user._id
    })
    res.redirect('/courses')
  } catch (e) {
    console.log(e)
  }
})

router.get('/:id', async (req, res) => {
  try{
    const course = await Course.findById(req.params.id)
    res.render('course', {
      layout: 'empty',
      title: `Курс ${course.title}`,
      course
  })
  }catch(e){
    console.log(e)
  }
})

module.exports = router