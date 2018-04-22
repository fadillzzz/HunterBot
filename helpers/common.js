/**
 * Check if a given message starts with a specific command name
 *
 * @param {String} commandName
 * @param {String} message
 * @return {Boolean}
 */
function isCommandEqualTo(commandName, message) {
    message = message.toLowerCase();
    return message.startsWith(commandName + ' ') || message === commandName;
}

module.exports = {isCommandEqualTo};
