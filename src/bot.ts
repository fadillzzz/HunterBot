import { Client, Message } from "discord.js";
import { Config } from "./interfaces/bot.interface";
import { Feature } from "./interfaces/feature.interface";

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
     * The listening channel for the bot.
     *
     * @var {String}
     */
    private listenChannel: string;

    /**
     * @param {Client} client Discord client
     * @param {Config} config Bot config
     */
    constructor(client: Client, config: Config) {
        this._features = [];
        this._client = client;
        this.config = config;
        this.listenChannel = config.listenChannel;
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
     * Sets the channel in which the bot actively listens for commands
     *
     * @return {this}
     */
    public setListenChannel(channelId: string): this {
        this.listenChannel = channelId;
        return this;
    }

    /**
     * Initialise the bot
     *
     * @return {this}
     */
    public init(): this {
        this._client.on("message", message => {
            if (this.understandable(message)) {
                message.content = message.content.substr(this.config.prefix.length);
                this._features.map(feature => {
                    feature.respond(this, message);
                });
            }
        });

        this._client.on("ready", () => {
            if (this.config.avatar) {
                this._client.user?.setAvatar(this.config.avatar);
            }

            this._features.map(feature => {
                if (feature.init) {
                    feature.init(this);
                }
            });
        });

        this._client.login(this.config.token);

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
            message.channel.id === this.listenChannel
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
        this._features.map(feature => {
            if (feature.on) {
                feature.on(event, data, this);
            }
        });

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
}
