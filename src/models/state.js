const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

//schema dos estados
const modelSchema = new mongoose.Schema({
    name: String
});

const modelName = 'State';

//verificando se tem conexão com esse model ou se não tiver cria uma conexão nova
if(mongoose.connection && mongoose.connection.models[modelName]) {
    module.exports = mongoose.connection.models[modelName];
}else{
    module.exports = mongoose.model(modelName, modelSchema);
}