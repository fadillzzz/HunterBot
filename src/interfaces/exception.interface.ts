import { Message } from "discord.js";

export interface ErrorHandler {
    /**
     * Checks if the given error is the correct error type to handle
     *
     * @param {Error} error
     * @return {Boolean}
     */
    validError(error: Error): boolean;

    /**
     * Handles the error thrown by the given message.
     * This should only be called if validError() returns true
     *
     * @param {Message} message
     */
    respond(message: Message): Promise<void>;
}
