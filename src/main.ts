import { Client } from "discord.js";
import { MongoClient } from "mongodb";
import BotManager from "./botManager";
import { default as config } from "./config.json";
import { default as configTemplate } from "./configTemplate.json";
import { DeleteHub, EditHub, Help, PostHub } from "./features";

(async () => {
    const mongo = new MongoClient(config.dbConnection);
    const client = new Client();
    client.login(config.token);
    client.on("ready", () => {
        if (config.avatar) {
            client.user?.setAvatar(config.avatar);
        }

        client.user?.setPresence({ activity: { name: `with Brachydios` }, status: "online" });
    });
    await mongo.connect();
    const botManager = new BotManager(client, configTemplate, mongo);
    botManager.init();
    console.log("Bot initialized");
})();
