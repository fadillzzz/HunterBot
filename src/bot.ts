import { Client, Message } from "discord.js";
import { Config } from "./interfaces/bot.interface";
import { Feature } from "./interfaces/feature.interface";
import BotManager from "./botManager";

export default class Bot {
    /**
     * A list of features enabled for the bot
     *
     * @var {Feature[]}
     */
    private _features: Feature[];

    /**
     * Discord Client instance
     *
     * @var {Client}
     */
    private _client: Client;

    /**
     * Bot's configuration
     *
     * @var {Config}
     */
    private config: Config;

    /**
     * A reference to the bot manager
     *
     * @var {Botmanager}
     */
    private manager: BotManager | null;

    /**
     * Guild ID
     *
     * @var {String}
     */
    private guildId: string;

    /**
     * @param {Client} client Discord client
     * @param {Config} config Bot config
     */
    constructor(client: Client, config: Config, guildId: string) {
        this._features = [];
        this._client = client;
        this.config = config;
        this.guildId = guildId;
        this.manager = null;
    }

    /**
     * Adds a functionality to the bot.
     *
     * @param {Feature[]} features
     * @return {this}
     */
    public addFeatures(features: Feature[]): this {
        this._features = this._features.concat(features);
        return this;
    }

    /**
     * Handles incoming message
     *
     * @return {this}
     */
    public handle(message: Message): this {
        if (this.understandable(message)) {
            message.content = message.content.substr(this.config.prefix.length);
            this._features.map((feature) => {
                feature.respond(this, message);
            });
        }

        return this;
    }

    /**
     * Check whether or not a message should be processed
     *
     * @param {Message} message
     * @return {Boolean}
     */
    public understandable(message: Message): boolean {
        // have a nice day
        if (
            message.content.startsWith(this.config.prefix) &&
            !message.author.bot &&
            (message.channel.id === this.config.listenChannel || !this.config.listenChannel)
        ) {
            return true;
        }

        return false;
    }

    /**
     * Broadcast an event to all features capable of handling events
     *
     * @param {String} event
     * @param {Object} data
     * @return {this}
     */
    public broadcast(event: string, data: any): this {
        this._features.map((feature) => {
            if (feature.on) {
                feature.on(event, data, this);
            }
        });

        if (event === "configUpdated" && this.manager) {
            this.manager.updateBotConfig(this.guildId, this.config);
        }

        return this;
    }

    /**
     * Sets a reference to the bot manager
     *
     * @param {BotManager} manager
     * @return {this}
     */
    public setManager(manager: BotManager): this {
        this.manager = manager;
        return this;
    }

    /**
     * Retrieves the Discord client instance
     *
     * @return {Client}
     */
    get client(): Client {
        return this._client;
    }

    /**
     * Retrieves installed features
     *
     * @return {Feature[]}
     */
    get features(): Feature[] {
        return this._features;
    }

    /**
     * Retrieves the bot's command prefix
     *
     * @return {String}
     */
    get prefix(): string {
        return this.config.prefix;
    }
}
