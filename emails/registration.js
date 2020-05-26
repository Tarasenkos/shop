const keys = require('../keys')

module.exports = function(email, name) {
    return {
        to: email,
        from: keys.EMAIL_FROM,
        subject: 'Аккаунт создан',
        html: `
         <h1>Добро пожаловать, ${name}! </h1>
         <p>Вы успешно создали аккаунт с email ${email}</p>
         <hr/>

         <a href="${keys.BASE_URL}">Магазин</a>

        
        `
    }
    }
