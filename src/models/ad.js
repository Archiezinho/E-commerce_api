const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

//schema dos anuncios
const modelSchema = new mongoose.Schema({
    idUser: String,
    state: String,
    category: String,
    images:[Object],
    dateCreated: Date,
    title: String,
    price: Number,
    priceNegotiable: Boolean,
    description: String,
    views: Number,
    status: String
});

const modelName = 'Ad';

//verificando se tem conexão com esse model ou se não tiver cria uma conexão nova
if(mongoose.connection && mongoose.connection.models[modelName]) {
    module.exports = mongoose.connection.models[modelName];
}else{
    module.exports = mongoose.model(modelName, modelSchema);
}