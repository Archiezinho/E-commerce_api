const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { validationResult, matchedData } = require('express-validator');

const User = require('../models/user');
const State = require('../models/state');

module.exports = {
    signin: async (req, res) => {
        //validando se a request esta com erro
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            res.json({error: errors.mapped()});
            return;
        }
        //pegando os dados da request
        const data = matchedData(req);


        //validando o email
        const user = await User.findOne({email: data.email});
        if(!user){
            res.json({error:{email:{msg: 'E-mail e/ou senha errados!'}}});
            return;
        }

        //validando a senha
        const match = await bcrypt.compare(data.password, user.passwordHash);
        if(!match){
            res.json({error:{email:{msg: 'E-mail e/ou senha errados!'}}});
            return;
        }

        //gerando token e salvando-o
        const payload = (Date.now() + Math.random()).toString();
        const token = await bcrypt.hash(payload, 10);
        user.token = token;
        await user.save();

        res.json({token})

    },
    signup: async (req, res) => {
        //validando se a request esta com erro
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            res.json({error: errors.mapped()});
            return;
        }
        //pegando os dados da request
        const data = matchedData(req);

        // Verificando se e-mail já existe
        const user = await User.findOne({
            email: data.email
        });
        if(user){
            res.json({error:{email:{msg: 'E-mail já existe!'}}});
            return;
        }

        // Verificando se o estado existe
        if(mongoose.Types.ObjectId.isValid(data.state)){
            const stateItem = await State.findById(data.state);
            if(!stateItem){
                res.json({error:{state:{msg: 'Estado não existe!'}}});
                return;
            }
        }else{
            res.json({error:{state:{msg: 'Código de estado inválido!'}}});
            return;
        }
        //gerando hash da senha
        const passwordHash = await bcrypt.hash(data.password, 10);

        //gerando token
        const payload = (Date.now() + Math.random()).toString();
        const token = await bcrypt.hash(payload, 10);

        //cadastrando user
        const newUser = await User({
            name: data.name,
            email: data.email,
            passwordHash: passwordHash,
            token: token,
            state: data.state
        });
        await newUser.save();

        res.json({token});
    },
};