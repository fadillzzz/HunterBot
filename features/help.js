const {isCommandEqualTo} = require('../helpers/common.js');

class Help {
    get commandName() {
        return 'help';
    }

    respond(bot, message) {
        if (isCommandEqualTo('help', message.content)) {
            const commandList = bot.features.map(feature => feature.commandName);
            message.channel.send(`Available commands: \`${commandList.join('`, `')}\``, {
                reply: message.author
            });
        }
    }

    init(bot) {
        bot.client.user.setPresence({game: {name: 'Type /help'}, status: 'online'});
    }
}

module.exports = Help;
