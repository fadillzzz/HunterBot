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
                    value: "Get help with all the available commands.",
                },
            ],
        });
    }

    public respond(bot: Bot, message: Message) {
        if (isCommandEqualTo("help", message.content)) {
            const commandHelps = bot.features.map(feature => feature.commandHelpEmbed);
            const embed = new RichEmbed();

            commandHelps.forEach(helpEmbed => {
                if (helpEmbed && helpEmbed.fields && helpEmbed.fields[0]) {
                    embed.addField(helpEmbed.fields[0].name, helpEmbed.fields[0].value);
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
