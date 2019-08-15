import { Message } from "discord.js";
import { ErrorHandler } from "../../interfaces/exception.interface";
import { InvalidConfig } from "../common";
import Base from "./base";

export default class InvalidConfigHandler extends Base implements ErrorHandler {
    protected errorType = InvalidConfig;

    public async respond(message: Message): Promise<void> {
        message.channel.send("Bot is not configured correctly. Please notify an administrator");
    }
}
