const moment = require('moment');
const {isCommandEqualTo} = require('../helpers/common.js');
const {parsePassword, getEmbed, getHubByAuthor} = require('../helpers/hub.js');

class EditHub {
    constructor(config) {
        this._config = config;
        this._hubs = {};
    }

    respond(bot, message) {
        if (isCommandEqualTo('edit', message.content)) {
            this.editHub(bot, message);
        }
    }

    get commandName() {
        return 'edit';
    }

    get commandHelp() {
        return `\:arrow_forward: \`${this._config.prefix}edit <ID/Pass/Description> <Value>\`
Edit information of the hub you have previously posted.

Example:
\`/edit Pass 3434\``;
    }

    /**
     * Edits a hub on the quest board
     *
     * @param {Object} bot
     * @param {Object} message
     */
    editHub(bot, message) {
        const pieces = message.content.split(' ');

        if (pieces.length >= 3) {
            const attribute = pieces[1].toLowerCase();

            if (['id', 'pass', 'description'].includes(attribute)) {
                let newValue = attribute === 'description' ? pieces.slice(2).join(' ') : pieces[2];

                if (attribute === 'pass') {
                    newValue = parsePassword(newValue);
                }

                const hub = getHubByAuthor(this._hubs, message.author);

                if (hub) {
                    hub[attribute] = newValue;
                    this._hubs[hub.post.id] = hub;

                    this.applyEdit(hub);

                    message.channel.send('Your hub has been updated', {
                        reply: message.author
                    });
                } else {
                    message.channel.send('You have not posted a hub', {
                        reply: message.author
                    });
                }
            } else {
                message.channel.send('Valid attributes are `id`, `pass`, and `description`', {
                    reply: message.author
                });
            }
        } else {
            message.channel.send(this.commandHelp, {reply: message.author});
        }
    }

    /**
     * Actually applies the edit to the posted hub
     *
     * @param {Object} hub
     */
    applyEdit(hub) {
        const embed = getEmbed(hub.game, hub.id, hub.pass, hub.description, hub.author);

        if (hub.expires) {
            embed.footer.text += ' | Expires';
            embed.timestamp = hub.expires;
        }

        hub.post.edit('', {embed});
    }

    on(event, data) {
        if (event === 'hub-created') {
            this._hubs[data.post.id] = data;
        }

        if (event === 'hub-timer-set') {
            const hub = this._hubs[data.post.id];
            if (hub) {
                hub.expires = moment().utc().add(hub.timer, 'seconds').format();
                this._hubs[data.post.id] = hub;
                this.applyEdit(hub);
            }
        }

        if (event === 'hub-deleted') {
            delete this._hubs[data.post.id];
        }
    }
}

module.exports = EditHub;
