const jwt = require('jsonwebtoken');
const tokenModel = require('../models/token-model.js');
const userModel = require('../models/user-model.js');

class TokenService { // Creating token-gen service
    genTokens(payload) {
        const accessToken = jwt.sign(payload, process.env.SECRET_KEY, {expiresIn: '30m'}) // Creating accessToken
        const refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET_KEY, {expiresIn: '60d'}) // Creating refreshToken
        return {accessToken, refreshToken}
    }

    validateAccessToken(token) { // Validating access token function
        try {
            const userData = jwt.verify(token, process.env.SECRET_KEY); // Checking access token wth a SECRET KEY
            return userData; 
        } catch (e) {
            return null;
        }
    }
    validateRefreshToken(token) { // Validating refresh token function
        try {
            const userData = jwt.verify(token, process.env.REFRESH_SECRET_KEY); // Checking refresh token wth a REFRESH SECRET KEY
            return userData; 
        } catch (e) {
            return null;
        }
    }
 
    async saveToken(userId, refreshToken) { // Saving token
        const tokenData = await tokenModel.findOne({user: userId})
        if (tokenData) { // Checking for matching
            tokenData.refreshToken = refreshToken; // If match - rewrite refreshToken
            return tokenData.save(); // Update token value in the DB
        } // If the condition is false, the user is logging for the first time
          // So the DB doesn't have userId

        const token = await tokenModel.create({user: userId, refreshToken}) // Then, create a record in the DB
        return token;
    }

    async removeToken(refreshToken) { // Def for delete token function
        const tokenData = tokenModel.deleteOne({refreshToken}); // Deleting refresh token from token model
        return tokenData;  // Returning updated model to DB
    }

    async findToken(refreshToken) { // Def for finding token function
        const tokenData = tokenModel.findOne({refreshToken}); // Searching for refresh token in token model
        return tokenData;  // Returning updated model to DB
    }

    async deleteToken(userId) { // Def for finding token function
        const tokenData = tokenModel.findOne({user: userId}); // Searching for id in token model
        if (tokenData) {
            await tokenModel.deleteOne()
        }
    }

    // genResetToken(id, Hash) {
    //     const resetToken = jwt.sign(id, Hash, {expiresIn: '30m'}) // Creating resetToken
    //     return {resetToken};
    // }

    // async deleteResToken(email) { // Def for finding token function
    //     const tokenData = userModel.findOne({email}); // Searching for id in token model
    //     if (tokenData) {
    //         await tokenData.deleteOne({resetToken})
    //     }
    // }
};

module.exports = new TokenService(); // Export module to an obj