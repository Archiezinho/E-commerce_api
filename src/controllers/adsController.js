const { v4: uuid } = require('uuid');
const jimp = require('jimp');

const Category = require('../models/category');
const User = require('../models/user');
const Ad = require('../models/ad');
const State = require('../models/state');

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
        for (let i in cats) {
            categories.push({
                ...cats[i]._doc,
                img: `${process.env.BASE}/assets/images/${cats[i].slug}.png`
            });
        }

        res.json({ categories });;
    },
    addAction: async (req, res) => {
        //pegando os dados da requisição
        let { title, price, priceNeg, desc, cat, token } = req.body;

        //pegando os dados do usuario
        const user = await User.findOne({ token }).exec();

        //validando se o anuncio possui titulo e categoria
        if (!title || !cat) {
            res.json({ error: 'Titulo e/ou categoria não foram preenchidos!' });
            return;
        }

        //validando se o anuncio possui uma categoria valida
        const category = await Category.findById(cat).exec();
        if (!category) {
            res.json({ error: 'Categoria inexistente' });
            return;
        }


        //transformando o preço em float
        if (price) {// 8.000,35 = 8000.35
            price = price.replace('.', '').replace(',', '.');
            price = parseFloat(price);
        } else {
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
        newAd.description = desc;
        newAd.views = 0;

        //array com metodos de imagem
        const set = new Set(['image/jpeg', 'image/jpg', 'image/png']);

        //adição de uma ou varias imagens
        if (req.files && req.files.img) {
            if (req.files.img.length == undefined) {
                if (Array.from(set).includes(req.files.img.mimetype)) {
                    let url = await addImage(req.files.img.data);
                    newAd.images.push({
                        url,
                        default: false
                    });
                }
            } else {
                for (let i = 0; i < req.files.img.length; i++) {
                    if (Array.from(set).includes(req.files.img[i].mimetype)) {
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
        if (newAd.images.length > 0) {
            newAd.images[0].default = true;
        }
        //salvando o objeto no banco
        const info = await newAd.save();
        res.json({ id: info._id });
    },
    getList: async (req, res) => {
        //pegando os dados da requisição
        let { sort = 'asc', offset = 0, limit = 8, q, cat, state } = req.query;
        let filters = { status: true };
        let total = 0;

        //filtro de pesquisa
        if (q) {
            filters.title = { '$regex': q, '$options': 'i' };
        }

        //filtro categoria
        if (cat) {
            const c = await Category.findOne({ slug: cat }).exec();
            if (c) {
                filters.category = c._id.toString();
            }
        }

        //filtro de estado
        if (state) {
            const s = await State.findOne({ name: state.toUpperCase() }).exec();
            if (s) {
                filters.state = s._id.toString();
            }
        }

        //vendo o total de anuncios
        const adsTotal = await Ad.find(filters).exec();
        total = adsTotal.length;

        //fazendo a pesquisa no banco
        const adsData = await Ad.find(filters).sort({ dataCreated: (sort == 'desc' ? '-1' : '1') }).skip(parseInt(offset)).limit(parseInt(limit)).exec();
        let ads = [];
        for (let i in adsData) {
            let image;

            //verificando se possui uma imagem
            let defaultImg = adsData[i].images.find(e => e.default);
            if (defaultImg) {
                image = `${process.env.BASE}/media/${defaultImg.url}`;
            } else {
                image = `${process.env.BASE}/media/default.jpg`;
            }

            //criando o objeto do anuncio
            ads.push({
                id: adsData[i]._id,
                title: adsData[i].title,
                price: adsData[i].price,
                priceNegotiable: adsData[i].priceNegotiable,
                image
            });
        };

        res.json({ ads, total });
    },
    getItem: async (req, res) => {
        //pegando os dados da requisição
        let { id } = req.params;
        let { other = null } = req.query;

        //verificando se possui id
        if (!id) {
            res.json({ error: 'Sem produto' });
            return;
        }

        //pegando o anuncio no banco
        const ad = await Ad.findById(id);
        if (!ad) {
            res.json({ error: 'Produto inesistente' });
            return;
        }

        //aumentando o numero de views para cada acesso
        ad.views++;
        await ad.save();

        //pegando as imagens
        let images = [];
        for (let i in ad.images) {
            images.push(`${process.env.BASE}/media/${ad.images[i].url}`);
        }

        //pegando todas as informções necessarias do banco
        let category = await Category.findById(ad.category).exec();
        let userInfo = await User.findById(ad.idUser).exec();
        let stateInfo = await State.findById(ad.state).exec();

        //mastrar produtos do mesmo autor
        let others = [];
        if (other) {
            const otherData = await Ad.findById({ status: true, idUser: ad.idUser }).exec();

            for (let i in otherData) {
                if (otherData[i]._id.toString() != ad._id.toString()) {
                    let image = `${process.env.BASE}/media/default.jpg`;

                    let defaultImg = otherData[i].images.find(e => e.default);
                    if (defaultImg) {
                        image = `${process.env.BASE}/media/${defaultImg.url}`;
                    }

                    others.push({
                        id: otherData[i]._id,
                        title: otherData[i].title,
                        price: otherData[i].price,
                        priceNegotiable: otherData[i].priceNegotiable,
                        image
                    });
                }
            }
        }

        res.json({
            id: ad._id,
            title: ad.title,
            price: ad.price,
            priceNegotiable: ad.priceNegotiable,
            description: ad.description,
            dateCreated: ad.dataCreated,
            views: ad.views,
            images,
            category,
            userInfo: {
                name: userInfo.name,
                email: userInfo.email
            },
            stateName: stateInfo.name,
            others
        });

    },
    editAction: async (req, res) => {
        //pegando os dados da requisição
        let { id } = req.params;
        let { title, status, price, priceNeg, desc, cat, images, token } = req.body;

        //verificando se possui id
        if (!id) {
            res.json({ error: 'Sem produto' });
            return;
        }

        //pegando o anuncio no banco
        const ad = await Ad.findById(id);
        if (!ad) {
            res.json({ error: 'Produto inesistente' });
            return;
        }

        //verificando se o anuncio pretence a pessoa
        const user = await User.findOne({ token }).exec();
        if (user._id.toString() !== ad.idUser) {
            res.json({ error: 'Este anuncio não é seu' });
            return;
        }

        let updates = {};

        //verificando se possui o titulo na requisição
        if (title) {
            updates.title = title;
        }

        //transformando o preço em float
        if (price) {// 8.000,35 = 8000.35
            price = price.replace('.', '').replace(',', '.');
            price = parseFloat(price);
        } else {
            price = 0
        }

        //verificando se possui preço negociavel na requisição
        if (priceNeg) {
            updates.priceNegotiable = priceNeg;
        }

        //verificando se possui o status na requisição
        if (status) {
            updates.status = status
        }

        //verificando se possui a descrição na requisição
        if (desc) {
            updates.description = desc
        }

        //verificando se possui a categoria na requisição
        if (cat) {
            const category = await Category.findOne({ slug: cat }).exec();
            if (!category) {
                res.json({ error: 'Categoria inexistente' });
                return;
            }
            updates.category = category._id.toString();
        }

        //fazendo o update no banco
        await Ad.findByIdAndUpdate(id, { $set: updates })

        //adição de novas imagens
        if (req.files && req.files.img) {
            const adI = await Ad.findById(id);

            if (req.files.img.length == undefined) {
                if (['image/jpeg', 'image/jpg', 'image/png'].includes(req.files.img.mimetype)) {
                    let url = await addImage(req.files.img.data);
                    adI.images.push({
                        url,
                        default: false
                    });
                }
            } else {
                for (let i = 0; i < req.files.img.length; i++) {
                    if (['image/jpeg', 'image/jpg', 'image/png'].includes(req.files.img[i].mimetype)) {
                        let url = await addImage(req.files.img[i].data);
                        adI.images.push({
                            url,
                            default: false
                        });
                    }
                }
            }

            adI.images = [...adI.images];
            await adI.save();
        }

        res.json({});
    }
};