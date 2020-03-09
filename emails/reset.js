const keys=require('../keys')

module.exports=function(email,token){
    return {
        to:email,
        from:keys.MAIL_SENDER,
        subject:"Восстановление пароля",
        html:`
        <h1>Ви забули пароль ? </h1>
        <p>Якщо ви не подавали заявку на скидання пароля то проігноруйте це письмо</p>
        <p>Інакше перейдіть по ссилці - <a href="${keys.SITE_URL}/auth/password/${token}">Скинуть пароль</a></p>
        <hr/>
        <p><a href="${keys.SITE_URL}"> Мой сайт!</a></p>
        `
    }
}