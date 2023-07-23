const ApiError = require('../exceptions/api-error.js')

module.exports = function (err, req, res, next) { // Function for returning any type of errors  
    console.log(err);
    if (err instanceof ApiError) { // If error existing in ApiErrors
        return res.status(err.status).json({message: err.message, errors: err.errors})
    }
    return res.status(500).json({message: 'Unexpected error'})
}