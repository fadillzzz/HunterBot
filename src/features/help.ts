import { Message, MessageEmbed } from "discord.js";
import Bot from "../bot";
import { isCommandEqualTo } from "../helpers/common";
import { Feature } from "../interfaces/feature.interface";
import { Config } from "../interfaces/bot.interface";

export default class Help implements Feature {
    /**
     * Bot config
     *
     * @var {Config}
     */
    private config: Config;

    public readonly commandName = "help";

    /**
     * @param {Config} config
     */
    constructor(config: Config) {
        this.config = config;
    }

    get commandHelpEmbed(): MessageEmbed {
        return new MessageEmbed({
            fields: [
                {
                    name: `__Get help with all the available commands__`,
                    value: `:arrow_forward: \`${this.config.prefix}${this.commandName}\`

                            :information_source: <> Required
                            :information_source: [ ] Optional`,
                },
            ],
        });
    }

    public respond(bot: Bot, message: Message) {
        if (isCommandEqualTo("help", message.content)) {
            const commandHelps = bot.features.map(feature => feature.commandHelpEmbed);
            const embed = new MessageEmbed();

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
}
