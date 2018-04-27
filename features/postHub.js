const {isCommandEqualTo} = require('../helpers/common.js');
const {parsePassword, getEmbed} = require('../helpers/hub.js');

class PostHub {
    constructor(config) {
        this._config = config;
        this._games = {
            xx: 'MHXX',
            mhxx: 'MHXX',
            '4u': 'MH4U',
            mh4u: 'MH4U',
            '3u': 'MH3U',
            mh3u: 'MH3U',
            tri: 'MHTri',
            mhfu: 'MHFU',
            mhw: 'MHW',
            world: 'MHW'
        };
        this._hubs = {};
    }

    get commandName() {
        return 'post';
    }

    get commandHelpAsArray() {
        return [
            `\:arrow_forward: \`${this._config.prefix}${this.commandName} <Game> <Hub ID> <Pass> <Description>\``,
            'Post your online hub information.',
            '',
            'Example:',
            `\`${this._config.prefix}${this.commandName} XX 22-3333-4444-5555 6767 Let's hunt Crimson Fatalis\``
        ];
    }

    get commandHelp() {
        return this.commandHelpAsArray.join("\n");
    }

    respond(bot, message) {
        if (isCommandEqualTo('post', message.content)) {
            this.newHub(bot, message);
        }
    }

    /**
     * Translate a potential alt-name for a game to a more generic one
     *
     * @param {String} game
     * @return {String}
     */
    translateGame(game) {
        return this._games[game.toLowerCase()];
    }

    /**
     * Posts a new hub on the quest board
     *
     * @param {Object} bot
     * @param {Object} message
     */
    async newHub(bot, message) {
        const pieces = message.content.split(' ');

        if (this._hubs[message.author.id]) {
            message.channel.send(`You have already posted a hub`, {
                reply: message.author
            });

            return;
        }

        if (pieces.length >= 4) {
            const game = this.translateGame(pieces[1]);

            if (game) {
                const id = pieces[2];
                const pass = parsePassword(pieces[3]);
                const description = pieces.slice(4).join(' ') || 'N/A';

                const post = await bot.client.channels.get(this._config.postHubChannel).send('', {
                    embed: getEmbed(game, id, pass, description, message.author)
                });

                this._hubs[message.author.id] = true;

                bot.broadcast('hub-created', {
                    game,
                    id,
                    pass,
                    description,
                    author: message.author,
                    post
                });

                message.channel.send(`Your hub has been posted to <#${this._config.postHubChannel}>`, {
                    reply: message.author
                });
            } else {
                message.channel.send('Invalid game!', {reply: message.author});
            }
        } else {
            message.channel.send(this.commandHelp);
        }
    }

    on(event, data) {
        if (event === 'hub-deleted') {
            delete this._hubs[data.author.id];
        }
    }
}

module.exports = PostHub;
