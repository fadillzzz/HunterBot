/**
 * Check if a given message starts with a specific command name
 *
 * @param {String} commandName
 * @param {String} message
 * @return {Boolean}
 */
export function isCommandEqualTo(commandName: string, message: string): boolean {
    message = message.toLowerCase();
    return message.startsWith(commandName + ' ') || message === commandName;
}
