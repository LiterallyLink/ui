const User = require('./schemas/User');

module.exports = {
    async getWallet(userId) {
        const user = await User.findOneAndUpdate(
            { userId },
            { $setOnInsert: { wallet: 0, bank: 0 } },
            { upsert: true, new: true }
        );
        return user.wallet;
    },

    async getBank(userId) {
        const user = await User.findOneAndUpdate(
            { userId },
            { $setOnInsert: { wallet: 0, bank: 0 } },
            { upsert: true, new: true }
        );
        return user.bank;
    },

    async getNetWorth(userId) {
        const user = await User.findOneAndUpdate(
            { userId },
            { $setOnInsert: { wallet: 0, bank: 0 } },
            { upsert: true, new: true }
        );
        return user.wallet + user.bank;
    },

    async addToWallet(userId, amount) {
        return await User.findOneAndUpdate(
            { userId },
            { $inc: { wallet: amount } },
            { new: true, upsert: true }
        );
    },

    async addToBank(userId, amount) {
        return await User.findOneAndUpdate(
            { userId },
            { $inc: { bank: amount } },
            { new: true, upsert: true }
        );
    },

    async subtractFromWallet(userId, amount) {
        const user = await User.findOne({ userId });
        
        if (!user || user.wallet < amount) {
            throw new Error('Insufficient wallet balance');
        }
        
        return await User.findOneAndUpdate(
            { userId },
            { $inc: { wallet: -amount } },
            { new: true }
        );
    },

    async subtractFromBank(userId, amount) {
        const user = await User.findOne({ userId });
        
        if (!user || user.bank < amount) {
            throw new Error('Insufficient bank balance');
        }
        
        return await User.findOneAndUpdate(
            { userId },
            { $inc: { bank: -amount } },
            { new: true }
        );
    },

    async setWallet(userId, amount) {
        return await User.findOneAndUpdate(
            { userId },
            { $set: { wallet: amount } },
            { new: true, upsert: true }
        );
    },

    async setBank(userId, amount) {
        return await User.findOneAndUpdate(
            { userId },
            { $set: { bank: amount } },
            { new: true, upsert: true }
        );
    }
}