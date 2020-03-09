const keys=require('../keys')
module.exports=function(email,name){
    return {
        to:email,
        from:keys.MAIL_SENDER,
        subject:'Акаунт создан',
        html:`
        Debil po imeni ${name}
        <h1>Добро пожаловать в мой магазин</h1>
        <p>Ви успешно создали аккаунт на сайте</p>
        <img src="https://www.wikipedia.org/portal/wikipedia.org/assets/img/Wikipedia-logo-v2.png"></img>
        <hr/>
        Мой сайт - <a href='${keys.SITE_URL}'>Главная страница</a>
        <a href="http://google.com">Golang</a>
        `
    }
}