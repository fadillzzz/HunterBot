const Discord = require('discord.js');
const moment = require('moment');

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
    }

    async respond(bot, message) {
        if (message.content.startsWith('post ') || message.content === 'post') {
            const pieces = message.content.split(' ');

            if (pieces.length >= 4) {
                const game = this.translateGame(pieces[1]);

                if (game) {
                    const id = pieces[2];
                    const pass = pieces[3].match(/^\d{4}$/) ? pieces[3] : 'N/A';
                    const description = pieces.slice(4).join(' ') || 'N/A';

                    const post = await bot.client.channels.get(this._config.postHubChannel).send('', {
                        embed: this.getEmbed(game, id, pass, description, message)
                    });

                    post.delete(7200 * 1000);
                } else {
                    message.channel.send('Invalid game!', {
                        reply: message.author
                    });
                }
            } else {
                message.channel.send(`${this._config.prefix}post [Game] [Hub ID] [Password] [Description]`, {
                    reply: message.author
                });
            }
        }
    }

    /**
     * Generate the rich embed object for the hub
     *
     * @param {String} game
     * @param {String} id
     * @Param {String} pass
     * @param {String} description
     * @param {String} message
     * @return {Object}
     */
    getEmbed(game, id, pass, description, message) {
        const expDate = moment().utc().add(2, 'hours');

        return (new Discord.RichEmbed({
            title: `[${game}] ${id}`,
            fields: [{
                name: `Password: ${pass}`,
                value: description
            }],
            timestamp: expDate.format(),
            footer: {
                text: `${message.author.tag} | Expires`,
                icon_url: message.author.displayAvatarURL
            }
        })).setColor('RANDOM');
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
}

module.exports = PostHub;
