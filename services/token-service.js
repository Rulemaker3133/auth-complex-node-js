const jwt = require('jsonwebtoken');
const tokenModel = require('../models/token-model.js')

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
}

module.exports = new TokenService(); // Export module to an obj