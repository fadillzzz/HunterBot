import Bot from '../bot';
import {Message, MessageEmbed} from 'discord.js';

export interface Feature {
    /**
     * A command name that'll trigger the bot's function
     *
     * @var {String}
     */
    commandName: string;

    /**
     * Respond to a posted message
     *
     * @param {Bot} bot
     * @param {Message} message
     */
    respond(bot: Bot, message: Message): void;

    /**
     * Do prep-work, if necessary
     *
     *
     * @param {Bot} bot
     */
    init?(bot: Bot): void;

    /**
     * Listens for events from the bot instance
     *
     *
     * @param {String} event
     * @param {Object} data
     * @param {Bot} bot
     */
    on?(event: string, data: any, bot: Bot): void;

    /**
     * Should return a rich embed describing the command
     *
     * @var {MessageEmbed}
     */
    commandHelpEmbed?: MessageEmbed;
}
