const { checkSchema } = require('express-validator');

module.exports = {
    signup: checkSchema({
        name: {
            trim: true,
            isLength: {
                options: { min: 2}
            },
            errorMessage: 'Nome precisa pelo menos ter dois caracteres.'
        },
        email: {
            isEmail: true,
            normalizeEmail: true,
            errorMessage: 'E-mail inválido'
        },
        password: {
            isLength: {
                options: { min: 2}
            },
            errorMessage: 'Senha precisa pelo menos ter dois caracteres.'
        },
        state: {
            notEmpty: true,
            errorMessage: 'Estado não preenchido.'
        }
    }),
    signin: checkSchema({
        email: {
            isEmail: true,
            normalizeEmail: true,
            errorMessage: 'E-mail inválido'
        },
        password: {
            isLength: {
                options: { min: 2}
            },
            errorMessage: 'Senha precisa pelo menos ter dois caracteres.'
        }
    })
};