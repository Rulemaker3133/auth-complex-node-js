module.exports = class ApiError extends Error { // Extend errors
    status;
    errors;

    constructor(status, message, errors = []) {
        super(message);
        this.status = status;
        this.errors = errors;
    }


    static UnauthorizedError() { // Static functions - can be used WITHOUT Class example
        return new ApiError(401, 'Unauthorized user')
    } 
    
    static BadRequest(message, errors = []) { // Uncorrect user request
        return new ApiError(400, message, errors);
    }
}