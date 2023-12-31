const Router = require('express').Router;
const userController = require('../controllers/user-controller.js');
const router = new Router(); // Creating new routing obj
const {body} = require('express-validator');
const authMiddleware = require('../middlewares/auth-middleware.js')

router.post('/register', 
    body('email').isEmail(), // Checking for valid email
    body('password').isLength({min: 8, max: 20}), // Checking for valid email password
    userController.register); // For registering a new user in a DB
router.post('/login', userController.login); // For authoriztion
router.post('/logout', userController.logout); // For login out of the session
router.get('/activate/:link', userController.activate); // For activation through mail
router.get('/refresh', userController.refresh); // For refreshToken updating in the DB
router.get('/users', authMiddleware, userController.getUsers); // For getting list of the users
router.post('/forget-password', userController.forgetPass);
router.get('/reset/:link', userController.reset);
router.post('/reset-password', userController.resPass);

module.exports = router;
