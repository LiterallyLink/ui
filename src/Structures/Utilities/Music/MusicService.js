class MusicService {
    constructor(client) {
        this.client = client;
        this.setupPlayerEvents();
    }

    setupPlayerEvents() {
        this.client.player.events.on('playerStart', (queue, track) => {
            this.client.events.get('playerStart').run(queue, track);
        });

        this.client.player.events.on('error', (queue, error) => {
            this.client.events.get('playerError').run(queue, error);
        });

        this.client.player.events.on('emptyQueue', (queue) => {
            this.client.events.get('playerEmptyQueue').run(queue);
        });

        console.log("Player events registered successfully.");
    }
}

module.exports = MusicService;