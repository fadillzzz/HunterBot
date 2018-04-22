const {isCommandEqualTo} = require('../helpers/common.js');
const {getHubByAuthor} = require('../helpers/hub.js');

class DeleteHub {
    constructor() {
        this._hubs = {};
        this._timer = 7200;
    }

    get commandName() {
        return 'delete';
    }

    respond(bot, message) {
        if (isCommandEqualTo('delete', message.content)) {
            const hub = getHubByAuthor(this._hubs, message.author);

            if (hub) {
                this.deleteHub(bot, hub.post);

                message.channel.send('Your hub has been deleted', {
                    reply: message.author
                });
            } else {
                message.channel.send('You have not posted a hub', {
                    reply: message.author
                });
            }
        }
    }

    /**
     * Deletes a hub from the quest board
     *
     * @param {Object} post
     */
    deleteHub(bot, post) {
        if (this._hubs[post.id]) {
            bot.broadcast('hub-deleted', this._hubs[post.id]);
            delete this._hubs[post.id];
            post.delete();
        }
    }

    on(event, data, bot) {
        if (event === 'hub-created') {
            const timer = setTimeout(this.deleteHub.bind(this, data.post), this._timer * 1000);
            this._hubs[data.post.id] = Object.assign({}, data, {timer});
            bot.broadcast(
                'hub-timer-set',
                Object.assign({}, this._hubs[data.post.id], {timer: this._timer})
            );
        }
    }
}

module.exports = DeleteHub;
