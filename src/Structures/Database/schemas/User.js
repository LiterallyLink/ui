const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    balance: {
        type: Number,
        default: 0,
        min: 0
    },
});

module.exports = model('User', UserSchema);