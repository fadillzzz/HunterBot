import Base from "../base";
import { ErrorHandler } from "../../../interfaces/exception.interface";
import { InvalidOption } from "../../settings";
import { Message } from "discord.js";

export default class InvalidPlatformHandler extends Base implements ErrorHandler {
    protected errorType = InvalidOption;

    public async respond(message: Message): Promise<void> {
        message.channel.send("Invalid option!", {
            reply: message.author,
        });
    }
}
