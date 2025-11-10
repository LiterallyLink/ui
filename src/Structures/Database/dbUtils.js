const User = require('./schemas/User');

module.exports = {
    async getBalance(userId) {
        const user = await User.findOneAndUpdate(
            { userId },
            { $setOnInsert: { balance: 0 } },
            { upsert: true, new: true }
        );
        return user.balance;
    },

    async addBalance(userId, amount) {
        return await user.findOneAndUpdate(
            { userId },
            { $inc: { balance: amount } },
            { new: true, upsert: true }
        );
    },

    async subtractBalance(userId, amount) {
        return await User.findOneAndUpdate(
            { userId },
            { $inc: { balance: -amount } },
            { new: true, upsert: true }
        );
    },

    async setBalance(userId, amount) {
        return await User.findOneAndUpdate(
            { userId },
            { $set: { balance: amount } },
            { new: true, upsert: true }
        );
    }
}