import { Message } from "discord.js";
import { UnknownExceptionHandler } from "../exceptions/handlers";
import { ErrorHandler } from "../interfaces/exception.interface";

/**
 * Check if a given message starts with a specific command name
 *
 * @param {String} commandName
 * @param {String} message
 * @return {Boolean}
 */
export function isCommandEqualTo(commandName: string, message: string): boolean {
    message = message.toLowerCase();
    return message.startsWith(commandName + " ") || message === commandName;
}

export function handleErrorWithFallback(error: Error, message: Message, handlers: ErrorHandler[]) {
    for (const handler of handlers) {
        if (handler.validError(error)) {
            handler.respond(message);
            return;
        }
    }

    new UnknownExceptionHandler().respond(error, message);
}
