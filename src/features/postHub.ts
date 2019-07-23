import { Message, RichEmbed, TextChannel } from "discord.js";
import Bot from "../bot";
import { checkMessageExists, delayAction } from "../decorators/common";
import { Games } from "../enums/hub.enum";
import { InvalidConfig, InvalidGame, InvalidId, InvalidSyntax } from "../exceptions/common";
import { InvalidPlatform } from "../exceptions/postHub";
import { isCommandEqualTo } from "../helpers/common";
import { getEmbed } from "../helpers/hub";
import { Feature } from "../interfaces/feature.interface";
import { HubPrototype } from "../interfaces/hub.interface";
import { PostHubConfig as Config, PostHubStrategy } from "../interfaces/postHub.interface";
import { Common, World } from "./postHubExt";

export default class PostHub implements Feature {
    /**
     * Configuration for this feature
     *
     * @var {Config}
     */
    private config: Config;

    /**
     * User mapping that determines whether or not they've posted a hub
     *
     * @var {Object}
     */
    private hubs: { [propName: string]: boolean } = {};

    /**
     * Maps games to their respective postHub implementation
     *
     * @var {Object}
     */
    private hubStrategies: { [propName: string]: PostHubStrategy } = {};

    public readonly commandName = "post";

    /**
     * @param {Config} config
     */
    constructor(config: Config) {
        this.config = config;
        // Is there a better way to do this?
        this.hubStrategies = {
            mhw: new World(config.games.mhw),
            mh4u: new Common(config.games.mh4u, Games.MH4U),
            mhxx: new Common(config.games.mhxx, Games.MHXX),
            mhgu: new Common(config.games.mhgu, Games.MHGU),
            // Do people play this still?
            mhgen: new Common(config.games.mhgen, Games.MHGEN),
        };
    }

    get commandHelpEmbed(): RichEmbed {
        const prefix = this.config.prefix;
        const commandName = this.commandName;
        // To do: Update this for each game-specific postHub implementation
        return new RichEmbed({
            fields: [
                {
                    name: `\:arrow_forward: \`${prefix}${commandName} <Game> <Hub ID> <Pass> <Description>\``,
                    value:
                        `Post your online hub information.\n\n` +
                        `Example:\n` +
                        `\`${prefix}${commandName} XX 22-3333-4444-5555 6767 Let's hunt Fatalis\`\n`,
                },
            ],
        });
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
        const matchedGame = Games[game.toUpperCase() as keyof typeof Games];

        if (!matchedGame) {
            throw new InvalidGame();
        }

        return matchedGame;
    }

    /**
     * Posts a new hub on the quest board
     *
     * @param {Bot} bot
     * @param {Message} message
     */
    private async newHub(bot: Bot, message: Message) {
        if (this.hubs[message.author.id]) {
            message.channel.send("You have already posted a hub", {
                reply: message.author,
            });

            return;
        }

        try {
            const pieces = message.content.split(" ");

            if (pieces.length <= 1) {
                throw new InvalidSyntax();
            }

            const game: string = this.translateGame(pieces[1]);
            const hubStrat: PostHubStrategy = this.hubStrategies[game.toLowerCase()];

            hubStrat.setMessage(message).isSyntaxValid();

            const hubInfo: HubPrototype = hubStrat.extractHubInfo();
            const channelId: string = hubStrat.getTargetChannelId();
            const channel: TextChannel = bot.client.channels.get(channelId) as TextChannel;

            const post = await channel.send("", {
                embed: getEmbed(hubInfo),
            });

            this.hubs[message.author.id] = true;

            bot.broadcast("hub-created", { ...hubInfo, post });

            message.channel.send(`Your hub has been posted to <#${channelId}>`, {
                reply: message.author,
            });
        } catch (e) {
            // To do: Abstract these error handlers (should use visitor here, probably)
            if (e instanceof InvalidSyntax) {
                message.channel.send("", { embed: this.commandHelpEmbed });
                return;
            }

            if (e instanceof InvalidGame) {
                message.channel.send("Invalid game!", {
                    reply: message.author,
                });
                return;
            }

            if (e instanceof InvalidConfig) {
                message.channel.send("Bot is not configured correctly. Please notify an administrator");
                return;
            }

            if (e instanceof InvalidPlatform) {
                message.channel.send("Invalid platform!", {
                    reply: message.author,
                });
                return;
            }

            if (e instanceof InvalidId) {
                message.channel.send("Invalid ID!", {
                    reply: message.author,
                });
                return;
            }

            message.channel.send("Something went wrong. Please notify an administrator");
            throw e;
        }
    }

    public on(event: string, data: any) {
        if (event === "hub-deleted") {
            delete this.hubs[data.author.id];
        }
    }
}
