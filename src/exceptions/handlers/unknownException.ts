import { Message } from "discord.js";

export default class UnknownExceptionHandler {
    public async respond(error: Error, message: Message): Promise<void> {
        message.channel.send("Something went wrong. Please notify an administrator");
        throw error;
    }
}
