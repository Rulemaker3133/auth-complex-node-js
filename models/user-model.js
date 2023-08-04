const {Schema, model} = require('mongoose');

const UserSchema = new Schema({ // Creating user scheme with speified parameters
    email: {type: String, unique: true, required: true}, // User email - required
    password: {type: String, required: true}, // User password - required
    isActivated: {type: Boolean, default: false}, // Does the user activate his account via email - FALSE from beginning
    activationLink: {type: String}, // User's activation Link from email
    resetToken: {type: String}, // User's reset Link from email
    isReset: {type: Boolean, default: false},
    resetLink: {type: String}
})


module.exports = model('User', UserSchema);