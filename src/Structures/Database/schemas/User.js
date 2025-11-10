const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    wallet: {
        type: Number,
        default: 0,
        min: 0
    },
    bank: {
        type: Number,
        default: 0,
        min: 0
    }
});

UserSchema.virtual('netWorth').get(function() {
    return this.wallet + this.bank;
});

module.exports = model('User', UserSchema);