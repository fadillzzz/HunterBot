const Discord = require('discord.js');
const config = require('./config.json');
const Bot = require('./bot.js');
const PostHub = require('./features/postHub.js');

const client = new Discord.Client();
const bot = new Bot(client, config);
bot.addFeatures([new PostHub(config)]).init();
