const { v4: uuid } = require('uuid');
const jimp = require('jimp');

const Category = require('../models/category');
const User = require('../models/user');
const Ad = require('../models/ad');

//função para adcionar a imagem
const addImage = async (buffer) => {
    //gerando nome de imagem
    let newName = `${uuid()}.jpg`;

    //adicionando a imagem a pasta media
    let tmpImg = await jimp.read(buffer);
    tmpImg.cover(500, 500).quality(80).write(`./public/media/${newName}`);

    return newName;
}

module.exports = {
    getCategories: async (req, res) => {
        //pegando as categorias
        const cats = await Category.find();

        //gerando um objeto já com o link das imagens
        let categories = [];
        for(let i in cats){
            categories.push({
                ...cats[i]._doc,
                img: `${process.env.BASE}/assets/images/${cats[i].slug}.png`
            });
        }

        res.json({categories});;
    },
    addAction: async (req, res) => {
        //pegando os dados da requizição
        let { title, price, priceNeg, desc, cat, token} = req.body;

        //pegando os dados do usuario
        const user = await User.findOne({token}).exec();

        //validando se o anuncio possui titulo e categoria
        if(!title || !cat){
            res.json({error: 'Titulo e/ou categoria não foram preenchidos!'});
            return;
        }

        //transformando o preço em float
        if(price){// 8.000,35 = 8000.35
            price = price.replace('.','').replace(',','.');
            price = parseFloat(price);
        }else{
            price = 0
        }

        //construindo o objeto anuncio
        const newAd = new Ad();
        newAd.status = true;
        newAd.idUser = user._id;
        newAd.state = user.state;
        newAd.dateCreated = new Date();
        newAd.title = title;
        newAd.category = cat;
        newAd.price = price;
        newAd.priceNegotiable = (priceNeg == 'true') ? true : false;
        newAd.description= desc;
        newAd.views = 0;

        //array com metodos de imagem
        const set = new Set(['image/jpeg', 'image/jpg', 'image/png']);

        //adição de uma ou varias imagens
        if(req.files && req.files.img){
            if(req.files.img.length == undefined){
                if(Array.from(set).includes(req.files.img.mimetype)){
                    let url = await addImage(req.files.img.data);
                    newAd.images.push({
                        url,
                        default: false
                    });
                }
            }else{
                for(let i=0; i<req.files.img.length; i++){
                    if(Array.from(set).includes(req.files.img[i].mimetype)){
                        let url = await addImage(req.files.img[i].data);
                        newAd.images.push({
                            url,
                            default: false
                        });
                    }
                }
            }
        }
        //tornando a primeira imagem como principal
        if(newAd.images.length > 0){
            newAd.images[0].default = true;
        }
        //salvando o objeto no banco
        const info = await newAd.save();
        res.json({id: info._id});
    },
    getList: async (req, res) => {
        
    },
    getItem: async (req, res) => {

    },
    editAction: async (req, res) => {

    }
};