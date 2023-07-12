const express = require('express');
const router = express.Router();

const auth = require('./middlewares/auth');

const authValidator = require('./validators/authValidator');
const userValidator = require('./validators/userValidator');

const authController = require('./controllers/authController');
const userController = require('./controllers/userController');
const adsController = require('./controllers/adsController');

// rota de teste
router.get('/ping', (req, res) => {
    res.json({pong: true});
});

// rota para ver os estados disponiveis
router.get('/states', userController.getStates);

// rotas de login e cadastro
router.post('/user/signin', authValidator.signin, authController.signin);
router.post('/user/signup', authValidator.signup, authController.signup);

// rotas para ver e modificar as informações do usuario
router.get('/user/me', auth.private, userController.info);
router.put('/user/me', userValidator.editAction, auth.private, userController.editAction);

// rota para ver as categorias
router.get('/categories', adsController.getCategories);

// rotas para adicionar, listar, pegar um unico e modificar os anuncios de produtos
router.post('/ad/add', auth.private, adsController.addAction);
router.get('/ad/list', adsController.getList);
router.get('/ad/item', adsController.getItem);
router.post('/ad/:id', auth.private, adsController.editAction)

module.exports = router;