import { Message, RichEmbed } from "discord.js";
import Bot from "../bot";
import { isCommandEqualTo } from "../helpers/common";
import { Feature } from "../interfaces/feature.interface";

export default class Help implements Feature {
    /**
     * Command prefix
     *
     * @var {String}
     */
    private prefix: string;

    public readonly commandName = "help";

    /**
     * @param {String} prefix
     */
    constructor(prefix: string) {
        this.prefix = prefix;
    }

    get commandHelpEmbed(): RichEmbed {
        return new RichEmbed({
            fields: [
                {
                    name: `\:arrow_forward: \`${this.prefix}${this.commandName}\``,
                    value: "Get help with all the available commands.\n\n:information_source: <> Required\n:information_source: [ ] Optional",
                },
            ],
        });
    }

    public respond(bot: Bot, message: Message) {
        if (isCommandEqualTo("help", message.content)) {
            const commandHelps = bot.features.map(feature => feature.commandHelpEmbed);
            const embed = new RichEmbed();

            commandHelps.forEach(helpEmbed => {
                if (helpEmbed && helpEmbed.fields) {
                    helpEmbed.fields.forEach(help => {
                        embed.addField(help.name, help.value);
                    });
                }
            });

            message.author.send("", { embed });
            message.react("✅");
        }
    }

    public init(bot: Bot) {
        bot.client.user.setPresence({ game: { name: "Type /help" }, status: "online" });
    }
}
