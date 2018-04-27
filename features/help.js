const {isCommandEqualTo} = require('../helpers/common.js');
const Discord = require('discord.js');

class Help {
    constructor(config) {
        this._config = config;
    }

    get commandName() {
        return 'help';
    }

    get commandHelpAsArray() {
        return [
            `\:arrow_forward: \`${this._config.prefix}${this.commandName}\``,
            'Get help with all the available commands.'
        ];
    }

    get commandHelp() {
        return this.commandHelpAsArray.join("\n");
    }

    respond(bot, message) {
        if (isCommandEqualTo('help', message.content)) {
            const commandHelps = bot.features.map(feature => feature.commandHelpAsArray).filter(help => {
                return help.constructor.name === 'Array' && help.length > 0;
            });
            message.channel.send('', {
                embed: new Discord.RichEmbed({
                    // To do: This should be handled by each feature
                    fields: commandHelps.map(help => ({
                        name: help[0],
                        value: help.length > 1 ? help.slice(1).join("\n") : 'No description available.'
                    }))
                })
            });
        }
    }

    init(bot) {
        bot.client.user.setPresence({game: {name: 'Type /help'}, status: 'online'});
    }
}

module.exports = Help;
