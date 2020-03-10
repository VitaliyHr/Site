module.exports=function(req,res,next){
    res.status(422).render('404',{
        layout:'empty',
        title:'Страница не найдена'
    })
}