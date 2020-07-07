import { Message, MessageReaction, MessageEmbed, User } from "discord.js";
import moment from "moment";
import Bot from "../../bot";
import { checkMessageExists, delayAction } from "../../decorators/common";
import { Games } from "../../enums/hub.enum";
import { InvalidIdHandler, InvalidSyntaxHandler } from "../../exceptions/handlers";
import { InvalidAttributeHandler } from "../../exceptions/handlers/editHub";
import { handleErrorWithFallback, isCommandEqualTo } from "../../helpers/common";
import { getEmbed, getHubByAuthor } from "../../helpers/hub";
import { ErrorHandler } from "../../interfaces/exception.interface";
import { Feature } from "../../interfaces/feature.interface";
import { Hub, HubConfig as Config } from "../../interfaces/hub.interface";
import Common from "./common";
import World from "./world";

export default class EditHub implements Feature {
    /**
     * Configuration for this feature
     *
     * @var {Config}
     */
    private config: Config;

    /**
     * A collection of objects, each of which represents a hub
     *
     * @var {[string]: Hub}
     */
    private hubs: { [propName: string]: Hub } = {};

    private errorHandlers: ErrorHandler[] = [];

    public readonly commandName = "edit";

    /**
     * @param {Config} config
     */
    constructor(config: Config) {
        this.config = config;
        this.hubs = {};
        this.errorHandlers = [
            new InvalidSyntaxHandler(this.commandHelpEmbed),
            new InvalidIdHandler(),
            new InvalidAttributeHandler(),
        ];
    }

    @delayAction(250)
    @checkMessageExists
    public respond(bot: Bot, message: Message) {
        if (isCommandEqualTo(this.commandName, message.content)) {
            this.editHub(bot, message);
        }
    }

    get commandHelpEmbed(): MessageEmbed {
        const prefix = this.config.prefix;
        const commandName = prefix + this.commandName;
        const childFields: Array<{ name: string; value: string }> = [
            new World().commandHelpEmbedField(commandName),
            new Common().commandHelpEmbedField(commandName),
        ];

        return new MessageEmbed({
            fields: [
                {
                    name: `__Edit posted online hub information__`,
                    value: `Selected game and platform may not be edited`,
                },
                ...childFields,
            ],
        });
    }

    /**
     * Edits a hub on the quest board
     *
     * @param {Bot} bot
     * @param {Message} message
     */
    private async editHub(bot: Bot, message: Message) {
        const hub = getHubByAuthor(this.hubs, message.author) as Hub;

        if (!hub) {
            message.channel.send("You have not posted a hub", {
                reply: message.author,
            });

            return;
        }

        const strategy = hub.game === Games.MHW ? new World() : new Common();

        try {
            strategy.setMessage(message).isSyntaxValid();
            const update: { [key: string]: string | null } = strategy.getUpdatedInfo();
            const updatedHub: Hub = { ...hub, ...update };
            this.hubs[hub.post.id] = updatedHub;

            await this.applyEdit(updatedHub);

            message.react("✅");
        } catch (e) {
            this.errorHandlers.forEach(handler => {
                if (handler instanceof InvalidAttributeHandler) {
                    handler.setValidAttributes(strategy.getUpdatableAttributes());
                }
            });

            handleErrorWithFallback(e, message, this.errorHandlers);
        }
    }

    /**
     * Actually applies the edit to the posted hub
     *
     * @param {Hub} hub
     */
    private async applyEdit(hub: Hub) {
        const embed = getEmbed(hub);

        if (hub.expires) {
            embed.footer!.text += " | Expires";
            embed.setTimestamp(hub.expires);
        }

        if (hub.full) {
            embed.title += ` 🚧 **Full** 🚧`;
        }

        await hub.post.edit("", embed);
    }

    /**
     * Set up a button to mark a hub as full
     *
     * @param {Bot} bot
     * @param {*} data
     * @return {this}
     */
    private setUpHubFullButton(bot: Bot, data: any): this {
        data.post.react("🚧");

        // Collector may not have been initialised at this point, so let's be careful
        if (this.hubs[data.post.id].collector) {
            this.hubs[data.post.id].collector.stop();
        }

        // To do: Have a default timer, just in case `expires` doesn't get set ever
        const collector = data.post.createReactionCollector(
            (reaction: MessageReaction) => reaction.emoji.name === "🚧",
            {
                time: moment(this.hubs[data.post.id].expires).diff(moment()),
            },
        );

        this.hubs[data.post.id] = Object.assign({}, this.hubs[data.post.id], { collector });

        collector.on("collect", (reaction: MessageReaction, user: User) => {
            if (user.id !== bot.client.user?.id) {
                reaction.users.remove(user);
            }

            if (user.id === data.author.id) {
                if (reaction.emoji.name === "🚧") {
                    this.hubs[data.post.id].full = !this.hubs[data.post.id].full;
                    this.applyEdit(this.hubs[data.post.id]);
                }
            }
        });

        return this;
    }

    public on(event: string, data: any, bot: Bot) {
        if (event === "hub-created") {
            this.hubs[data.post.id] = data;
            this.setUpHubFullButton(bot, data);
        }

        if (event === "hub-timer-set") {
            const hub = this.hubs[data.post.id];

            if (hub) {
                hub.expires = moment()
                    .utc()
                    .add(data.timer, "seconds")
                    .toDate();
                this.hubs[data.post.id] = hub;
                this.applyEdit(hub);
                // Set up the button again to reset the reaction collector timer
                this.setUpHubFullButton(bot, data);
            }
        }

        if (event === "hub-deleted") {
            this.hubs[data.post.id].collector.stop();
            delete this.hubs[data.post.id];
        }
    }
}
