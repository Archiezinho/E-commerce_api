const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

//schema dos usuários
const modelSchema = new mongoose.Schema({
    name: String,
    email: String,
    state: String,
    passwordHash: String,
    token: String
});

const modelName = 'User';

//verificando se tem conexão com esse model ou se não tiver cria uma conexão nova
if(mongoose.connection && mongoose.connection.models[modelName]) {
    module.exports = mongoose.connection.models[modelName];
}else{
    module.exports = mongoose.model(modelName, modelSchema);
}