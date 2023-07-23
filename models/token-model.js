const {Schema, model} = require('mongoose');

const TokenSchema = new Schema({ //Creating token scheme
    user: {type: Schema.Types.ObjectId, ref: 'User'}, 
    refreshToken: {type: String, required: true} // Refresh token - required
})


module.exports = model('Token', TokenSchema); 