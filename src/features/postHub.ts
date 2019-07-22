import {PostHubConfig as Config} from '../interfaces/hub.interface';
import {Feature} from '../interfaces/feature.interface';
import {Games} from '../enums/hub.enum';
import {Message, RichEmbed, TextChannel} from 'discord.js';
import {isCommandEqualTo} from '../helpers/common';
import {parsePassword, getEmbed} from '../helpers/hub';
import {delayAction, checkMessageExists} from '../decorators/common';
import Bot from '../bot';

export default class PostHub implements Feature {
    /**
     * Configuration for this feature
     *
     * @var {Config}
     */
    private config: Config;

    /**
     * A collection of objects, each of which represents a hub
     *
     * @var {Object}
     */
    private hubs: {[propName: string]: any} = {};

    public readonly commandName = 'post';

    /**
     * @param {Config} config
     */
    constructor(config: Config) {
        this.config = config;
    }

    get commandHelpEmbed(): RichEmbed {
        return new RichEmbed({fields: [{
            name:  `\:arrow_forward: \`${this.config.prefix}${this.commandName} <Game> <Hub ID> <Pass> <Description>\``,
            value: `Post your online hub information.${"\n\n"}` +
                   `Example:${"\n"}` +
                   `\`${this.config.prefix}${this.commandName} XX 22-3333-4444-5555 6767 Let's hunt Crimson Fatalis\`${"\n"}`
        }]});
    }

    @delayAction(250)
    @checkMessageExists
    public respond(bot: Bot, message: Message) {
        if (isCommandEqualTo(this.commandName, message.content)) {
            this.newHub(bot, message);
        }
    }

    /**
     * Translate a potential alt-name for a game to a more generic one
     *
     * @param {String} game
     * @return {String}
     */
    private translateGame(game: string): string {
        return Games[game.toUpperCase() as keyof typeof Games];
    }

    /**
     * Posts a new hub on the quest board
     *
     * @param {Bot} bot
     * @param {Message} message
     */
    private async newHub(bot: Bot, message: Message) {
        const pieces = message.content.split(' ');

        if (this.hubs[message.author.id]) {
            message.channel.send('You have already posted a hub', {
                reply: message.author
            });

            return;
        }
        // To do: Create exceptions for all these errors
        if (pieces.length >= 4) {
            const game = this.translateGame(pieces[1]);

            if (game) {
                const id = pieces[2];
                const pass = parsePassword(pieces[3]);
                const description = pieces.slice(4).join(' ') || 'N/A';
                const channel = bot.client.channels.get(this.config.postHubChannel);

                if (channel) {
                    const post = await (<TextChannel>channel).send('', {
                        embed: getEmbed(game, id, pass, description, message.author)
                    });

                    this.hubs[message.author.id] = true;

                    bot.broadcast('hub-created', {
                        game,
                        id,
                        pass,
                        description,
                        author: message.author,
                        post
                    });

                    message.channel.send(`Your hub has been posted to <#${this.config.postHubChannel}>`, {
                        reply: message.author
                    });
                } else {
                    message.channel.send('Bot is not configured correctly. Please notify an administrator');
                }
            } else {
                message.channel.send('Invalid game!', {reply: message.author});
            }
        } else {
            message.channel.send('', {embed: this.commandHelpEmbed});
        }
    }

    public on(event: string, data: any) {
        if (event === 'hub-deleted') {
            delete this.hubs[data.author.id];
        }
    }
}
