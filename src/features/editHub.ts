import { Message, MessageReaction, RichEmbed, User } from "discord.js";
import moment from "moment";
import Bot from "../bot";
import { checkMessageExists, delayAction } from "../decorators/common";
import { isCommandEqualTo } from "../helpers/common";
import { getEmbed, getHubByAuthor, parsePassword } from "../helpers/hub";
import { Feature } from "../interfaces/feature.interface";
import { Hub, HubConfig as Config } from "../interfaces/hub.interface";

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

    public readonly commandName = "edit";

    /**
     * @param {Config} config
     */
    constructor(config: Config) {
        this.config = config;
        this.hubs = {};
    }

    @delayAction(250)
    @checkMessageExists
    public respond(bot: Bot, message: Message) {
        if (isCommandEqualTo(this.commandName, message.content)) {
            this.editHub(bot, message);
        }
    }

    get commandHelpEmbed(): RichEmbed {
        return new RichEmbed({
            fields: [
                {
                    name: `\:arrow_forward: \`${this.config.prefix}${this.commandName} <ID/Pass/Description> <Value>\``,
                    value:
                        `Edit information of the hub you have previously posted.$\n\n` +
                        `Example:\n` +
                        `\`${this.config.prefix}${this.commandName} Pass 3434\`\n`,
                },
            ],
        });
    }

    /**
     * Edits a hub on the quest board
     *
     * @param {Bot} bot
     * @param {Message} message
     */
    private editHub(bot: Bot, message: Message) {
        const pieces = message.content.split(" ");

        if (pieces.length >= 3) {
            const attribute = pieces[1].toLowerCase();

            if (["id", "pass", "description"].includes(attribute)) {
                let newValue = attribute === "description" ? pieces.slice(2).join(" ") : pieces[2];

                if (attribute === "pass") {
                    newValue = parsePassword(newValue);
                }

                const hub = getHubByAuthor(this.hubs, message.author) as Hub;

                if (hub) {
                    hub[attribute] = newValue;
                    this.hubs[hub.post.id] = hub;

                    this.applyEdit(hub);

                    message.channel.send("Your hub has been updated", {
                        reply: message.author,
                    });
                } else {
                    message.channel.send("You have not posted a hub", {
                        reply: message.author,
                    });
                }
            } else {
                message.channel.send("Valid attributes are `id`, `pass`, and `description`", {
                    reply: message.author,
                });
            }
        } else {
            message.channel.send(this.commandHelpEmbed);
        }
    }

    /**
     * Actually applies the edit to the posted hub
     *
     * @param {Hub} hub
     */
    private applyEdit(hub: Hub) {
        const embed = getEmbed(hub.game, hub.id, hub.pass, hub.description, hub.author);

        if (hub.expires) {
            embed.footer!.text += " | Expires";
            embed.timestamp = hub.expires;
        }

        if (hub.full) {
            let newTitle = embed.title!.match(/^\[.*\]/)![0];
            newTitle += ` 🚧**Hub Full**🚧`;
            embed.title = newTitle;
        }

        hub.post.edit("", { embed });
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

        collector.on("collect", (reaction: MessageReaction) => {
            reaction.users
                .filter((user: User) => {
                    return user.id !== data.author.id && user.id !== bot.client.user.id;
                })
                .forEach((user: User) => {
                    reaction.remove(user);
                });
            reaction.users.forEach((user: User) => {
                if (user.id === data.author.id) {
                    if (reaction.emoji.name === "🚧") {
                        this.hubs[data.post.id].full = !this.hubs[data.post.id].full;
                        this.applyEdit(this.hubs[data.post.id]);
                        reaction.remove(user.id);
                    }
                }
            });
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
