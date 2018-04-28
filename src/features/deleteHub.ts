import {isCommandEqualTo} from '../helpers/common';
import {getHubByAuthor} from '../helpers/hub';
import {DeleteHubConfig as Config, Hub} from '../interfaces/hub.interface';
import {Message, RichEmbed} from 'discord.js';
import {Feature} from '../interfaces/feature.interface';
import Bot from '../bot';

export default class DeleteHub implements Feature {
    /**
     * Configuration for this feature
     *
     * @var {Config}
     */
    private config: Config;

    /**
     * A collection of objects, each of which represents a hub
     *
     * @var {[string]: Hub}
     */
    private hubs: {[propName: string]: Hub} = {};

    public readonly commandName = 'delete';

    /**
     * @param {Config} config
     */
    constructor(config: Config) {
        this.hubs = {};
        this.config = config;
    }

    get commandHelpEmbed(): RichEmbed {
        return new RichEmbed({fields: [{
            name: `\:arrow_forward: \`${this.config.prefix}${this.commandName}\``,
            value: 'Delete the hub you have previously posted.'
        }]});
    }

    respond(bot: Bot, message: Message) {
        if (isCommandEqualTo('delete', message.content)) {
            const hub = <Hub>getHubByAuthor(this.hubs, message.author);

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
     * @param {Bot} bot
     * @param {Message} post
     */
    deleteHub(bot: Bot, post: Message) {
        if (this.hubs[post.id]) {
            bot.broadcast('hub-deleted', this.hubs[post.id]);
            delete this.hubs[post.id];
            post.delete();
        }
    }

    on(event: string, data: any, bot: Bot) {
        if (event === 'hub-created') {
            const timer = setTimeout(this.deleteHub.bind(this, bot, data.post), this.config.timer * 1000);
            this.hubs[data.post.id] = Object.assign({}, data, {timer});
            bot.broadcast(
                'hub-timer-set',
                Object.assign({}, this.hubs[data.post.id], {timer: this.config.timer})
            );
        }
    }
}
