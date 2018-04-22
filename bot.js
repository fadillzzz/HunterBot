class Bot {
    /**
     * @param {Object} client Discord client
     * @param {Object} config Bot config
     */
    constructor(client, config) {
        this._features = [];
        this._client = client;
        this._config = config;
        this._listenChannel = config.listenChannel;
    }

    /**
     * Adds a functionality to the bot.
     *
     * @param {Object} feature
     * @return {this}
     */
    addFeatures(features) {
        this._features = this._features.concat(features);
        return this;
    }

    /**
     * Sets the channel in which the bot actively listens for commands
     *
     * @return {this}
     */
    setListenChannel(channelId) {
        this._listenChannel = channelId;
        return this;
    }

    /**
     * Initialise the bot
     *
     * @return {this}
     */
    init() {
        this._client.on('message', message => {
            if (this.understandable(message)) {
                message.content = message.content.substr(this._config.prefix.length);
                this._features.map(feature => {
                    feature.respond(this, message);
                });
            }
        });

        this._client.on('ready', () => {
            if (this._config.avatar) {
                this._client.user.setAvatar(this._config.avatar);
            }

            this._features.map(feature => {
                if (feature.init) {
                    feature.init(this);
                }
            });
        });

        this._client.login(this._config.token);

        return this;
    }

    /**
     * Check whether or not a message should be processed
     * 
     * @return {Boolean}
     */
    understandable(message) {
        // have a nice day
        if (message.content.startsWith(this._config.prefix) &&
            ! message.author.bot &&
            message.channel.id === this._listenChannel) {
            return true;
        }

        return false;
    }

    /**
     * Broadcast an event to all features capable of handling events
     *
     * @param {String} event
     * @param {Object} data
     * @return {this}
     */
    broadcast(event, data) {
        this._features.map(feature => {
            if (feature.on) {
                feature.on(event, data, this);
            }
        });
    }

    /**
     * Retrieves the Discord client instance
     *
     * @return {Object}
     */
    get client() {
        return this._client;
    }

    /**
     * Retrieves installed features
     *
     * @return {Object[]}
     */
    get features() {
        return this._features;
    }
}

module.exports = Bot;
