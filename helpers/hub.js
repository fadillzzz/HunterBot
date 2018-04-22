const Discord = require('discord.js');

/**
 * Tests a password and returns "N/A" if it fails
 *
 * @return {String}
 */
function parsePassword(password) {
    return password.match(/^\d{4}$/) ? password : 'N/A';
}

/**
 * Generate the rich embed object for the hub
 *
 * @param {String} game
 * @param {String} id
 * @Param {String} pass
 * @param {String} description
 * @param {String} author
 * @return {Object}
 */
function getEmbed(game, id, pass, description, author) {
    return (new Discord.RichEmbed({
        title: `[${game}] ${id}`,
        fields: [{
            name: `Password: ${pass}`,
            value: description
        }],
        footer: {
            text: author.tag,
            icon_url: author.displayAvatarURL
        }
    })).setColor('RANDOM');
}

/**
 * Retrieves a hub, given a message author
 *
 * @param {Object} author
 * @return {Object}
 */
function getHubByAuthor(hubs, author) {
    return Object.values(hubs).find(hub => {
        return hub.author.id === author.id;
    });
}

module.exports = {parsePassword, getEmbed, getHubByAuthor};
