module.exports = class Event {
    constructor(client, name, options = {}) {
        this.name = name;
        this.client = client;
        this.type = options.once ? 'once' : 'on';
        this.emitter = (typeof options.emitter === 'string' ? this.client[options.emitter] : options.emitter) || this.client;
    }

    async run(...args) {
        throw new Error(`[Event] :: ${this.name} does not implement required run() method`);
    }

    reload() {
        if (!this.store || !this.file?.path) {
            throw new Error(`[Event] :: ${this.name} cannot be reloaded - missing store or file path`);
        }
        return this.store.load(this.file.path);
    }
}