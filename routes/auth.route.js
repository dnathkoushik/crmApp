const userController = require('../controllers/auth.controller');

module.exports = (app) => {
    app.post('/crmApp/api/v1/auth/signup', userController.signUp);
}