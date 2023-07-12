const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

//schema das categorias
const modelSchema = new mongoose.Schema({
    name: String,
    slug: String
});

const modelName = 'Category';

//verificando se tem conexão com esse model ou se não tiver cria uma conexão nova
if(mongoose.connection && mongoose.connection.models[modelName]) {
    module.exports = mongoose.connection.models[modelName];
}else{
    module.exports = mongoose.model(modelName, modelSchema);
}