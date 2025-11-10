const mongoose = require('mongoose');

module.exports = class Database {
    constructor(client) {
        this.client = client;
    }

    async connect() {
        try {
            await mongoose.connect(process.env.MONGO_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            console.log('[Database] :: Connected to MongoDB');
        } catch (error) {
            console.error('[Database] :: Connection failed:', error);
            process.exit(1);
        }
    }
}