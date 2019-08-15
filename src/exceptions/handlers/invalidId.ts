import { Message } from "discord.js";
import { ErrorHandler } from "../../interfaces/exception.interface";
import { InvalidId } from "../common";
import Base from "./base";

export default class InvalidIdHandler extends Base implements ErrorHandler {
    protected errorType = InvalidId;

    public async respond(message: Message): Promise<void> {
        message.channel.send("Invalid ID!", {
            reply: message.author,
        });
    }
}
