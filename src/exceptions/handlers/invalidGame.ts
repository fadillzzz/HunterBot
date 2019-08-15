import { Message } from "discord.js";
import { ErrorHandler } from "../../interfaces/exception.interface";
import { InvalidGame } from "../common";
import Base from "./base";

export default class InvalidGameHandler extends Base implements ErrorHandler {
    protected errorType = InvalidGame;

    public async respond(message: Message): Promise<void> {
        message.channel.send("Invalid game!", {
            reply: message.author,
        });
    }
}
