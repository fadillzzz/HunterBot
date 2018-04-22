const Discord = require('discord.js');
const config = require('./config.json');
const Bot = require('./bot.js');
const PostHub = require('./features/postHub.js');
const EditHub = require('./features/editHub.js');
const DeleteHub = require('./features/deleteHub.js');
const Help = require('./features/help.js');

const client = new Discord.Client();
const bot = new Bot(client, config);
bot.addFeatures([new PostHub(config), new EditHub(config), new DeleteHub(), new Help()]).init();
