const UserModel = require('../models/user-model.js'); // For defining user Schema
const bcrypt = require('bcrypt'); // For password hashing
const uuid = require('uuid'); // For generating strings
const mailService = require('../services/mail-service.js') // For activation letters
const salt = process.env.SALT; // Creating salt for hash function
const tokenService = require('./token-service.js'); // For defining token Schema
const UserDto = require('../dtos/user-dto.js'); // For defining user DTO Schema
const ApiError = require('../exceptions/api-error.js');
const tokenModel = require('../models/token-model.js');
const crypto = require('crypto')

class UserService { // User register service
    async register (email, password) { // Creating user by email & password
        const candidate = await UserModel.findOne({email}) // Check for existing user
        if (candidate) { // If the user with this email are existing - throw error
            throw ApiError.BadRequest(`User with email ${email} is already existing`);
        } 

        const hashPassword = await bcrypt.hash(password, salt); // Hashing password, for secure storing
        const activationLink = uuid.v4(); // Creating unique link, like: v75sa-assdsa-456asd-as-sds 
        const user = await UserModel.create({email, password: hashPassword, activationLink}); // Creating new user in DB  
        await mailService.sendActivationLetter(email, `${process.env.API_URL}/api/activate/${activationLink}`); // Sending activation leter to specified email  
        
        const userDto = new UserDto(user); // id, email, isActivated
        const tokenPair = tokenService.genTokens(/*payload for token generation*/{...userDto}); // Deploying DTO to new object using '...'
        await tokenService.saveToken(userDto.id, tokenPair.refreshToken); // Saving refreshToken into DB

        return {...tokenPair, user: userDto} // Returns user info and tokenPair
    }

    async activate(activationLink) {
        const user = await UserModel.findOne({activationLink}) // Try to find user by current activationLink 
        // P.S.: 'user' is already created model by UserModel (even if I do not specified anything, except the activation link), with current data
        if (!user) { // If not found user - throw error
            throw ApiError.BadRequest('Uncorrect activation link');
        }
        user.isActivated = true; // Mark user as activated
        await user.save(); // Save the updated current user structure in DB
    }

    async login(email, password) { // Log in function def
        const user = await UserModel.findOne({email}) // Try to find registered user by email
        if (!user) { // If not found user - throw error 
            throw ApiError.BadRequest('User with this email was not found');
        }
        const isValidPass = await bcrypt.compare(password, user.password); // Checking hashed password for validity
        if (!isValidPass) {
            throw ApiError.BadRequest('Invalid password')
        }
        const userDto = new UserDto(user); // Generating userDTO structure (id, email, isActivated) 
        const tokenPair = tokenService.genTokens(/*payload for token generation*/{...userDto}); // Deploying DTO to new object using '...'
        
        await tokenService.saveToken(userDto.id, tokenPair.refreshToken); // Saving refreshToken into DB
        return {...tokenPair, user: userDto} // Returns user info and tokenPair
    }

    async logout(refreshToken) { // Log out function def
        const token = await tokenService.removeToken(refreshToken); // Delete refreshToken from DB
        return token;
    }

    async refresh(refreshToken) { // Token refreshing function def
        if (!refreshToken) { // Checking for a valid value 
            throw ApiError.UnauthorizedError(); // If the user do not have token - he is not authorized
        }
        const userData = tokenService.validateRefreshToken(refreshToken); // Validation of refresh token
        const tokenFromDb = await tokenService.findToken(refreshToken); // Searching for refresh token in DB
        if (!userData || !tokenFromDb) { // If two previous actions gone wrong - throw error
            throw ApiError.UnauthorizedError();
        }

        const user = UserModel.findById(userData.id); // Finding user by his id
        const userDto = new UserDto(user); // Generating userDTO structure (id, email, isActivated) 
        const tokenPair = tokenService.genTokens(/*payload for token generation*/{...userDto}); // Deploying DTO to new object using '...'
        
        await tokenService.saveToken(userDto.id, tokenPair.refreshToken); // Saving refreshToken into DB
        return {...tokenPair, user: userDto} // Returns user info and tokenPair
    }

    async getAllUsers() { // Display user list function def
        const users = await UserModel.find();
        return users;
    }

    async forgetPassword(email) { // Forgot password function def
        const user = await UserModel.findOne({email}) // Find user by email

        if (!user) {
            throw ApiError.BadRequest('User with this email was not found'); // User doesn't exists
        }
        const userDto = new UserDto(user);
        await tokenService.deleteToken(userDto.id);
        const resetToken = crypto.randomBytes(32).toString("hex");
        const hash = await bcrypt.hash(resetToken, salt);
        // const reset = tokenService.genResetToken({id}, hash);
        // const tokenReset = reset.resetToken;
        user.resetToken = hash;
        const resetLink = uuid.v4(); 
        user.resetLink = resetLink;
        await mailService.sendResetPWLetter(email, `${process.env.API_URL}/api/reset/${resetLink}`);
        await user.save()
        return hash;
    }

    async reset(resetLink) {
        const user = await UserModel.findOne({resetLink}) // Try to find user by current activationLink 
        // P.S.: 'user' is already created model by UserModel (even if I do not specified anything, except the activation link), with current data
        if (!user) { // If not found user - throw error
            throw ApiError.BadRequest('Uncorrect reset link');
        }
        user.isReset = true; // Mark user as activated
        await user.save(); // Save the updated current user structure in DB
    }

    async resetPassword(userEmail, resToken, password) {
        const email = userEmail;
        const user = await UserModel.findOne({email})
        if (!user) {
            throw new Error('User is not found');
        }

        const isValid = bcrypt.compare(resToken, user.resetToken);
        if (!isValid) {
            throw new Error("Invalid or expired password reset token");
        }

        const isTrue = user.isReset;

        if (!isTrue) {
            throw new Error("Password is not reset token");
        }

        const hashPassword = await bcrypt.hash(password, salt);
        
        await UserModel.updateOne(
            {email: userEmail}, 
            {$set: {password: hashPassword}}, 
            {new: true}
        );
        const userDto = new UserDto(user);
        const tokenPair = tokenService.genTokens({...userDto})
        await tokenService.saveToken(userDto.id, tokenPair.refreshToken); // Saving refreshToken into DB
        await mailService.sendResetSuccesPW(userEmail)
        return {...tokenPair, user: userDto};
    }
}

module.exports = new UserService();