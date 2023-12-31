const userService = require('../services/user-service.js'); // Using user register service from created module
const {validationResult} = require('express-validator'); // Collecting the result of validation
const ApiError = require('../exceptions/api-error.js');

class UserController {
    async register(req, res, next) { // Function to Sign Up a user
        try {
            const errors = validationResult(req); 
            if (!errors.isEmpty()) { // Checking for validations errors
                return next(ApiError.BadRequest('Validation error', errors.array())) // Error "transfer" to the next middleware function
            }
            const {email, password} = req.body // Getting user input from request body
            const userData = await userService.register(email, password);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 60 * 24 * 60 * 60 * 1000, httpOnly: true}) // Send respone to browser cookie, with a refresh token stored inside
            // httpOnly switch is required for prevent getting cookie with token through javascript
            return res.json(userData); // Returning user data in json 
        } catch (e) {
            next(e); // Error "transfer" to the next middleware function to end with "ErrorHandler"
        }
    }

    async login(req, res, next) { // For user log in 
        try {
             const {email, password} = req.body; // Getting user input from request body
             const userData = await userService.login(email, password) // 60d * 24h * 60m * 60s * 1000ms - next line of code 
             res.cookie('refreshToken', userData.refreshToken, {maxAge: 60 * 24 * 60 * 60 * 1000, httpOnly: true}) // Send respone to browser cookie, with a refresh token stored inside
            // httpOnly switch is required for prevent getting cookie with token through javascript
            return res.json(userData); // Returning user data in json 
        } catch (e) {
            next(e); // Error "transfer" to the next middleware function to end with "ErrorHandler"
        }
    }

    async logout(req, res, next) {
        try {
            const {refreshToken} = req.cookies; // Getting refreshToken from cookies
            const token = await userService.logout(refreshToken); // Transfering the token inside logout function
            res.clearCookie('refreshToken'); // Delete cookie with refresh token
            return res.json(token); // Returning response with token to CLIENT  
        } catch (e) {
            next(e); // Error "transfer" to the next middleware function to end with "ErrorHandler"
        }
    }

    async activate(req, res, next) { // Activate user 
        try {
            const activationLink = req.params.link // Get the user's link fron request (previosly defined in router as "/activate/:link")
            await userService.activate(activationLink);
            return res.redirect(process.env.CLIENT_URL);
        } catch (e) {
            next(e); // Error "transfer" to the next middleware function to end with "ErrorHandler"
        }
    }

    async refresh(req, res, next) {
        try {
            const {refreshToken} = req.cookies; // Getting refreshToken from cookies 
            const userData = await userService.refresh(refreshToken); // 60d * 24h * 60m * 60s * 1000ms - next line of code 
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 60 * 24 * 60 * 60 * 1000, httpOnly: true}) // Send respone to browser cookie, with a refresh token stored inside
            // httpOnly switch is required for prevent getting cookie with token through javascript
            return res.json(userData); // Returning user data in json 
        } catch (e) {
            next(e); // Error "transfer" to the next middleware function to end with "ErrorHandler"
        }
    }

    async getUsers(req, res, next) { // Getting user list from DB
        try {
            const users = await userService.getAllUsers(); // Defining users for getting from DB
            return res.json(users); // Return response in json
        } catch (e) {
            next(e); // Error "transfer" to the next middleware function to end with "ErrorHandler"
        }
    }

    async forgetPass(req, res, next) { // Sending reset password email
        try {
            const {email} = req.body // Getting user input from request body
            const userData = await userService.forgetPassword(email);
            return res.json(userData);
        } catch (e) {
            next(e); // Error "transfer" to the next middleware function to end with "ErrorHandler"
        }
    }

    async reset(req, res, next) { // User reset pasword confirm
        try {
            const resetLink = req.params.link // Get the user's link fron request (previosly defined in router as "/reset/:link")
            await userService.reset(resetLink);
            return res.redirect(process.env.CLIENT_URL);
        } catch (e) {
            next(e); // Error "transfer" to the next middleware function to end with "ErrorHandler"
        }
    }

    async resPass(req, res, next) { // Changing password to new
        try {
            const userData = await userService.resetPassword(
                req.body.email,
                req.body.resetToken,
                req.body.password       
            );
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 60 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json(userData);
        } catch (e) {
            next(e); // Error "transfer" to the next middleware function to end with "ErrorHandler"
        }
    }
}


module.exports = new UserController();