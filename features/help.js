const {isCommandEqualTo} = require('../helpers/common.js');

class Help {
    constructor(config) {
        this._config = config;
    }

    get commandName() {
        return 'help';
    }

    get commandHelp() {
        return `\:arrow_forward: \`${this._config.prefix}help\`
Get help with all the available commands.`;
    }

    respond(bot, message) {
        if (isCommandEqualTo('help', message.content)) {
            const commandHelps = bot.features.map(feature => feature.commandHelp || '');
            message.channel.send(commandHelps.join("\n\n\n"), {reply: message.author});
        }
    }

    init(bot) {
        bot.client.user.setPresence({game: {name: 'Type /help'}, status: 'online'});
    }
}

module.exports = Help;
