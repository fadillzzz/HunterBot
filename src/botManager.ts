import Bot from "./bot";
import { Client, Guild } from "discord.js";
import { Config } from "./interfaces/bot.interface";
import { DeleteHub, EditHub, Help, PostHub, Settings } from "./features";
import { MongoClient, Db } from "mongodb";

export default class BotManager {
    /**
     * A mapping of guild ID to bot instance
     *
     * @var {Record<String, Bot>}
     */
    private bots: Record<string, Bot>;

    /**
     * Discord Client instance
     *
     * @var {Client}
     */
    private client: Client;

    /**
     * Template config for new bot instances
     *
     * @var {Config}
     */
    private configTemplate: Config;

    /**
     * To do: consider using a repo pattern for this
     *
     * @var {Db}
     */
    private db: Db;

    constructor(client: Client, configTemplate: Config, mongo: MongoClient) {
        this.bots = {};
        this.configTemplate = configTemplate;
        this.client = client;
        // To do: consider putting the DB name in a config file?
        this.db = mongo.db("guildmarm");
    }

    /**
     * Initialise the manager by loading previously saved bots and register event handlers
     */
    public async init() {
        const settings = await this.db.collection("settings").find({}).toArray();

        for (const guildSettings of settings) {
            this.addBot(guildSettings.guildId, guildSettings.settings);
        }

        this.client.on("guildCreate", (guild) => this.addBot(guild.id));

        this.client.on("guildDelete", (guild) => this.removeBot(guild.id));

        this.client.on("message", (message) => {
            const guildId = message.guild?.id;
            if (guildId && this.bots[guildId]) {
                this.bots[guildId].handle(message);
            }
        });
    }

    /**
     * Add a new bot to the collection
     *
     * @param {string} guildId
     * @param {Config|null} settings
     */
    public addBot(guildId: string, settings?: Config) {
        const bot = this.createBot(guildId, settings);

        if (!settings) {
            // No settings implies that we're creating a brand new bot for a guild
            this.db.collection("settings").insertOne({
                guildId,
                settings: { ...this.configTemplate },
            });
        }

        this.bots[guildId] = bot;
    }

    /**
     * Removes a bot from the collection
     *
     * @param {string} guildId
     */
    public removeBot(guildId: string) {
        if (this.bots[guildId]) {
            this.db.collection("settings").findOneAndDelete({ guildId });
            delete this.bots[guildId];
        }
    }

    /**
     * Updates the config for the given guild ID
     *
     * @param {String} guildId
     * @param {Config} config
     * @return {this}
     */
    public updateBotConfig(guildId: string, config: Config): this {
        this.db.collection("settings").updateOne({ guildId }, { $set: { settings: config } });
        return this;
    }

    /**
     * Creates a bot instance with the default config
     *
     * @param {String} guildId
     * @param {Config|null} settings
     * @return {Bot}
     */
    private createBot(guildId: string, settings?: Config): Bot {
        const config = settings || { ...this.configTemplate };
        const bot = new Bot(this.client, config, guildId);

        bot.addFeatures([
            new PostHub(config),
            new EditHub(config),
            new DeleteHub(config),
            new Help(config),
            new Settings(config),
        ]);

        bot.setManager(this);

        return bot;
    }
}
