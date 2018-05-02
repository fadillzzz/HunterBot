import {isCommandEqualTo} from '../helpers/common';
import {Message, RichEmbed} from 'discord.js';
import {Feature} from '../interfaces/feature.interface';
import Bot from '../bot';

export default class Help implements Feature {
    /**
     * Command prefix
     *
     * @var {String}
     */
    private prefix: string;

    public readonly commandName = 'help';

    /**
     * @param {String} prefix
     */
    constructor(prefix: string) {
        this.prefix = prefix;
    }

    get commandHelpEmbed(): RichEmbed {
        return new RichEmbed({fields: [{
            name: `\:arrow_forward: \`${this.prefix}${this.commandName}\``,
            value: 'Get help with all the available commands.'
        }]});
    }

    respond(bot: Bot, message: Message) {
        if (isCommandEqualTo('help', message.content)) {
            const commandHelps = bot.features.map(feature => feature.commandHelpEmbed).filter(Boolean);
            const embed = new RichEmbed();

            commandHelps.forEach(helpEmbed => {
                // TS wouldn't shut up about the addField line unless I do this unnecessary check.
                // helpEmbed!.fields![0] in the if statement should've been enough, IMO.
                if (helpEmbed && helpEmbed.fields && helpEmbed.fields[0]) {
                    embed.addField(helpEmbed.fields[0].name, helpEmbed.fields[0].value);
                }
            });

            message.author.send('', {embed});
            message.react('✅');
        }
    }

    init(bot: Bot) {
        bot.client.user.setPresence({game: {name: 'Type /help'}, status: 'online'});
    }
}
