import { Message } from "discord.js";
import { ErrorHandler } from "../../../interfaces/exception.interface";
import { InvalidPlatform } from "../../postHub";
import Base from "../base";

export default class InvalidPlatformHandler extends Base implements ErrorHandler {
    protected errorType = InvalidPlatform;

    public async respond(message: Message): Promise<void> {
        message.channel.send("Invalid platform!", {
            reply: message.author,
        });
    }
}
