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
     * Retrieves the Discord client instance
     *
     * @return {Object}
     */
    get client() {
        return this._client;
    }
}

module.exports = Bot;
