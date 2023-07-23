module.exports = class UserDto { // Creating class of Data Transfer Object (DTO)
    email;
    id;
    isActivated;

    constructor(model) { // Constructing user model with specified params
        this.email = model.email;
        this.id = model._id; // MongoDB is adding '_' to id field, because it CONST
        this.isActivated = model.isActivated;
    }
}