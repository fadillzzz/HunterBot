import {Client} from 'discord.js';
import Bot from './bot';
import {PostHub, EditHub, DeleteHub, Help} from './features';
const config = require('./config.json');
const client = new Client();
const bot = new Bot(client, config);
bot.addFeatures([new PostHub(config), new EditHub(config), new DeleteHub(config), new Help(config.prefix)]).init();
