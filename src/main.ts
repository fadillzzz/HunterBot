import { Client } from "discord.js";
import Bot from "./bot";
import * as config from "./config.json";
import { DeleteHub, EditHub, Help, PostHub } from "./features";
const client = new Client();
const bot = new Bot(client, config);
bot.addFeatures([new PostHub(config), new EditHub(config), new DeleteHub(config), new Help(config.prefix)]).init();
console.log("Bot initialized");
