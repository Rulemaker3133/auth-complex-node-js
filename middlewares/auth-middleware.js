const ApiError = require('../exceptions/api-error.js');
const tokenService = require('../services/token-service.js');

module.exports = function (req, res, next) {
    try {
        const authorizationHeader = req.headers.authorization; // Getting authoriztion header from request
        if (!authorizationHeader) { // If not specified - throw error
            return next(ApiError.UnauthorizedError());
        }

        const accessToken = authorizationHeader.split(' ')[1]; // Divide token by 2 using space, to get the token
        // "Bearer 90f929vue9f9df9d0-f-0d-f" - we need only part '90f929vu...', so we split string and choose it as [1] element of array
        if (!accessToken) { // If can't get - throw error
            return next(ApiError.UnauthorizedError());
        }

        const userData = tokenService.validateAccessToken(accessToken); // Check the token for validity
        if(!userData) {
            return next(ApiError.UnauthorizedError());
        }

        req.user = userData; // Adding user data to 'user' field of request body
        next();
    } catch (e) {
        return next(ApiError.UnauthorizedError());
    }
}