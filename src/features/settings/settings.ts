import { Feature } from "../../interfaces/feature.interface";
import { handleErrorWithFallback, isCommandEqualTo } from "../../helpers/common";
import { Message, MessageEmbed } from "discord.js";
import Bot from "../../bot";
import { Config } from "../../interfaces/bot.interface";
import { SettingsStrategy } from "../../interfaces/settings.interface";
import { InvalidSyntaxHandler } from "../../exceptions/handlers";
import { ErrorHandler } from "../../interfaces/exception.interface";
import { InvalidSyntax } from "../../exceptions/common";
import Common from "./common";
import CommonGame from "./commonGame";
import World from "./world";

export default class Settings implements Feature {
    /**
     * Bot config
     *
     * @var {Config}
     */
    private config: Config;

    public readonly commandName = "settings";

    /**
     * Maps games to their respective postHub implementation
     *
     * @var {Object}
     */
    private strats: { [propName: string]: SettingsStrategy };

    private errorHandlers: ErrorHandler[] = [];

    /**
     * @param {Config} config
     */
    constructor(config: Config) {
        this.config = config;
        this.strats = {
            prefix: new Common(),
            listenChannel: new Common(),
            timer: new Common(),
            mh4u: new CommonGame(),
            mhxx: new CommonGame(),
            mhgu: new CommonGame(),
            mhgen: new CommonGame(),
            mhw: new World(),
        };

        this.errorHandlers = [new InvalidSyntaxHandler(this.commandHelpEmbed)];
    }

    get commandHelpEmbed(): MessageEmbed {
        return new MessageEmbed({
            fields: [
                {
                    name: `__Configure the bot__`,
                    value: `:arrow_forward: \`${this.config.prefix}${this.commandName}\``,
                },
            ],
        });
    }

    public respond(bot: Bot, message: Message) {
        if (isCommandEqualTo(this.commandName, message.content)) {
            try {
                const pieces = message.content.split(" ");

                if (pieces.length <= 1) {
                    throw new InvalidSyntax();
                }

                const strat = this.strats[pieces[1]];

                if (!strat) {
                    throw new InvalidSyntax();
                }

                strat.isSyntaxValid(pieces.slice(1));

                strat.updateConfig(this.config, pieces.slice(1));

                bot.broadcast("configUpdated", this.config);

                message.react("✅");
            } catch (e) {
                handleErrorWithFallback(e, message, this.errorHandlers);
            }
        }
    }
}
