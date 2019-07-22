import { Message, MessageReaction, RichEmbed, User } from "discord.js";
import Bot from "../bot";
import { isCommandEqualTo } from "../helpers/common";
import { getHubByAuthor } from "../helpers/hub";
import { Feature } from "../interfaces/feature.interface";
import { DeleteHubConfig as Config, Hub } from "../interfaces/hub.interface";

export default class DeleteHub implements Feature {
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

    public readonly commandName = "delete";

    /**
     * @param {Config} config
     */
    constructor(config: Config) {
        this.hubs = {};
        this.config = config;
    }

    get commandHelpEmbed(): RichEmbed {
        return new RichEmbed({
            fields: [
                {
                    name: `\:arrow_forward: \`${this.config.prefix}${this.commandName}\``,
                    value: "Delete the hub you have previously posted.",
                },
            ],
        });
    }

    public respond(bot: Bot, message: Message) {
        if (isCommandEqualTo("delete", message.content)) {
            const hub = getHubByAuthor(this.hubs, message.author) as Hub;

            if (hub) {
                this.deleteHub(bot, hub.post);

                message.react("✅");
            } else {
                message.channel.send("You have not posted a hub", {
                    reply: message.author,
                });
            }
        }
    }

    /**
     * Deletes a hub from the quest board
     *
     * @param {Bot} bot
     * @param {Message} post
     */
    private deleteHub(bot: Bot, post: Message) {
        if (this.hubs[post.id]) {
            bot.broadcast("hub-deleted", this.hubs[post.id]);
            clearTimeout(this.hubs[post.id].timer);
            this.hubs[post.id].collector.stop();
            delete this.hubs[post.id];
            post.delete();
        }
    }

    /**
     * Set up buttons for hub deletion and extension
     *
     * @param {Bot} bot
     * @param {*} data
     * @return {this}
     */
    private setUpActionButtons(bot: Bot, data: any): this {
        data.post.react("🗑");
        data.post.react("🔁");

        const collector = data.post.createReactionCollector(
            (reaction: MessageReaction) => ["🗑", "🔁"].includes(reaction.emoji.name),
            { time: this.config.timer * 1000 },
        );

        this.hubs[data.post.id] = Object.assign({}, this.hubs[data.post.id], { collector });

        collector.on("collect", (reaction: MessageReaction) => {
            reaction.users
                .filterArray((user: User) => {
                    return user.id !== data.author.id && user.id !== bot.client.user.id;
                })
                .forEach((user: User) => {
                    reaction.remove(user);
                });

            reaction.users.forEach((user: User) => {
                if (user.id === data.author.id) {
                    if (reaction.emoji.name === "🗑") {
                        this.deleteHub(bot, data.post);
                    }

                    if (reaction.emoji.name === "🔁") {
                        clearTimeout(this.hubs[data.post.id].timer);
                        this.hubs[data.post.id].collector.stop();
                        this.setUpTimer(bot, data).setUpActionButtons(bot, data);
                        reaction.remove(user.id);
                    }
                }
            });
        });

        return this;
    }

    /**
     * Set up a timer for automatic hub deletion
     *
     * @param {Bot} bot
     * @param {*} data
     * @return {this}
     */
    private setUpTimer(bot: Bot, data: any): this {
        const timer = setTimeout(this.deleteHub.bind(this, bot, data.post), this.config.timer * 1000);
        this.hubs[data.post.id] = Object.assign({}, this.hubs[data.post.id], { timer });
        bot.broadcast("hub-timer-set", Object.assign({}, this.hubs[data.post.id], { timer: this.config.timer }));

        return this;
    }

    public on(event: string, data: any, bot: Bot) {
        if (event === "hub-created") {
            this.hubs[data.post.id] = data;
            this.setUpTimer(bot, data);
            this.setUpActionButtons(bot, data);
        }
    }
}
