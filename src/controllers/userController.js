const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { validationResult, matchedData } = require('express-validator');

const State = require('../models/state');
const User = require('../models/user');
const Category = require('../models/category');
const Ad = require('../models/ad');

module.exports = {
    getStates: async (req, res) => {
        //pegando os estados
        let states = await State.find();
        res.json({ states })
    },
    info: async (req, res) => {
        let token = req.query.token;
        //pegando os dados do user,estado e os anuncios dele
        const user = await User.findOne({ token });
        const state = await State.findById(user.state);
        const ads = await Ad.find({ idUser: user._id.toString() });

        //adicionando a categoria dos anuncios
        let adList = []
        for (let i in ads) {
            const cat =  await Category.findById(ads[i].category);
            adList.push({ ...ads[i]._doc, category: cat.slug });
        }

        res.json({
            name: user.name,
            email: user.email,
            state: state.name,
            ads: adList
        });
    },
    editAction: async (req, res) => {
        //validando se a request esta com erro
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.json({ error: errors.mapped() });
            return;
        }

        //pegando os dados da request
        const data = matchedData(req);

        //criando o objeto para o update
        let updates = {};
        if(data.name){
            updates.name = data.name;
        }
        if(data.email){
            const emailCheck = await User.findOne({ email: data.email });
            if(emailCheck){
                res.json({error: 'Email já cadastrado.'});
                return;
            }
            updates.email = data.email;
        }
        if(data.state){
            if(mongoose.Types.ObjectId.isValid(data.state)){
                const stateCheck = await State.findById(data.state);
                if(!stateCheck){
                    res.json({error: 'Estado não existe.'});
                    return;
                }
            }else{
                res.json({error:{state:{msg: 'Código de estado inválido!'}}});
                return;
            }
            updates.state = data.state;
        }
        if(data.password){
            updates.passwordHash = await bcrypt.hash(data.password, 10);
        }

        //fazendo o update
        await User.findOneAndUpdate({token: data.token}, {$set: updates});

        res.json({success: 'Alterado com sucesso!'});
    }
};