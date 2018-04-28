import moment from 'moment';
import {isCommandEqualTo} from '../helpers/common';
import {parsePassword, getEmbed, getHubByAuthor} from '../helpers/hub';
import {Feature} from '../interfaces/feature.interface';
import {HubConfig as Config, Hub} from '../interfaces/hub.interface';
import {Message, RichEmbed} from 'discord.js';
import Bot from '../bot';

export default class EditHub implements Feature {
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

    public readonly commandName = 'edit';

    /**
     * @param {Config} config
     */
    constructor(config: Config) {
        this.config = config;
        this.hubs = {};
    }

    respond(bot: Bot, message: Message) {
        if (isCommandEqualTo(this.commandName, message.content)) {
            this.editHub(bot, message);
        }
    }

    get commandHelpEmbed(): RichEmbed {
        return new RichEmbed({fields: [{
            name:  `\:arrow_forward: \`${this.config.prefix}${this.commandName} <ID/Pass/Description> <Value>\``,
            value: `Edit information of the hub you have previously posted.${"\n\n"}` +
                   `Example:${"\n"}` +
                   `\`${this.config.prefix}${this.commandName} Pass 3434\`${"\n"}`
        }]});
    }

    /**
     * Edits a hub on the quest board
     *
     * @param {Bot} bot
     * @param {Message} message
     */
    editHub(bot: Bot, message: Message) {
        const pieces = message.content.split(' ');

        if (pieces.length >= 3) {
            const attribute = pieces[1].toLowerCase();

            if (['id', 'pass', 'description'].includes(attribute)) {
                let newValue = attribute === 'description' ? pieces.slice(2).join(' ') : pieces[2];

                if (attribute === 'pass') {
                    newValue = parsePassword(newValue);
                }

                const hub = <Hub>getHubByAuthor(this.hubs, message.author);

                if (hub) {
                    hub[attribute] = newValue;
                    this.hubs[hub.post.id] = hub;

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
            message.channel.send(this.commandHelpEmbed);
        }
    }

    /**
     * Actually applies the edit to the posted hub
     *
     * @param {Hub} hub
     */
    applyEdit(hub: Hub) {
        const embed = getEmbed(hub.game, hub.id, hub.pass, hub.description, hub.author);

        if (hub.expires) {
            embed.footer!.text += ' | Expires';
            embed.timestamp = hub.expires;
        }

        hub.post.edit('', {embed});
    }

    on(event: string, data: any) {
        if (event === 'hub-created') {
            this.hubs[data.post.id] = data;
        }

        if (event === 'hub-timer-set') {
            const hub = this.hubs[data.post.id];
            if (hub) {
                hub.expires = moment().utc().add(data.timer, 'seconds').toDate();
                this.hubs[data.post.id] = hub;
                this.applyEdit(hub);
            }
        }

        if (event === 'hub-deleted') {
            delete this.hubs[data.post.id];
        }
    }
}
