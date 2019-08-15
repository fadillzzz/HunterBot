import { Message, RichEmbed, TextChannel } from "discord.js";
import Bot from "../../bot";
import { checkMessageExists, delayAction } from "../../decorators/common";
import { Games } from "../../enums/hub.enum";
import { InvalidConfig, InvalidGame, InvalidId, InvalidSyntax } from "../../exceptions/common";
import {
    InvalidConfigHandler,
    InvalidGameHandler,
    InvalidIdHandler,
    InvalidPlatformHandler,
    InvalidSyntaxHandler,
} from "../../exceptions/handlers";
import { InvalidPlatform } from "../../exceptions/postHub";
import { handleErrorWithFallback, isCommandEqualTo } from "../../helpers/common";
import { getEmbed } from "../../helpers/hub";
import { ErrorHandler } from "../../interfaces/exception.interface";
import { Feature } from "../../interfaces/feature.interface";
import { HubPrototype } from "../../interfaces/hub.interface";
import { PostHubConfig as Config, PostHubStrategy } from "../../interfaces/postHub.interface";
import Common from "./common";
import World from "./world";

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

    private errorHandlers: ErrorHandler[] = [];

    public readonly commandName = "post";

    /**
     * @param {Config} config
     */
    constructor(config: Config) {
        this.config = config;
        // Is there a better way to do this?
        // To do: consider a simple if/else that checks if given game is MHWorld
        this.hubStrategies = {
            mhw: new World(config.games.mhw),
            mh4u: new Common(config.games.mh4u, Games.MH4U),
            mhxx: new Common(config.games.mhxx, Games.MHXX),
            mhgu: new Common(config.games.mhgu, Games.MHGU),
            // Do people play this still?
            mhgen: new Common(config.games.mhgen, Games.MHGEN),
        };

        this.errorHandlers = [
            new InvalidSyntaxHandler(this.commandHelpEmbed),
            new InvalidGameHandler(),
            new InvalidConfigHandler(),
            new InvalidPlatformHandler(),
            new InvalidIdHandler(),
        ];
    }

    get commandHelpEmbed(): RichEmbed {
        const prefix = this.config.prefix;
        const commandName = prefix + this.commandName;
        const fetched: { [key: string]: boolean } = {};
        const childFields: Array<{ name: string; value: string }> = [
            this.hubStrategies.mhw.commandHelpEmbedField(commandName),
            this.hubStrategies.mh4u.commandHelpEmbedField(commandName),
        ];

        return new RichEmbed({
            fields: [
                {
                    name: `__Post your online hub information__`,
                    value: `Valid games are: World, GU, XX, 4U`,
                },
                ...childFields,
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
            handleErrorWithFallback(e, message, this.errorHandlers);
        }
    }

    public on(event: string, data: any) {
        if (event === "hub-deleted") {
            delete this.hubs[data.author.id];
        }
    }
}
