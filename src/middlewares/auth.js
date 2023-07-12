const User = require('../models/user');

module.exports = {
    private: async (req, res, next) => {
        // vendo se o usuário possui um token
        if(!req.query.token && !req.body.token){
            res.json({notallowed: true});
            return;
        }

        //pegando o token
        let token = '';
        if(req.query.token){
            token = req.query.token;
        }
        if(req.body.token){
            token = req.body.token;
        }

        //vendo se ele está vazio
        if(token == ''){
            res.json({notallowed: true});
            return;
        }

        // vendo se ele possui a um usuário
        const user = await User.findOne({token: token});
        if(!user){
            res.json({notallowed: true});
            return;
        }

        next();
    }
};