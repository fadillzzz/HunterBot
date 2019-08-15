import { Message, RichEmbed } from "discord.js";
import { ErrorHandler } from "../../interfaces/exception.interface";
import { InvalidSyntax } from "../common";
import Base from "./base";

export default class InvalidSyntaxHandler extends Base implements ErrorHandler {
    /**
     * Embed to send that displays the correct syntax
     *
     * @var {RichEmbed}
     */
    private embed: RichEmbed;

    protected errorType = InvalidSyntax;

    /**
     * @param {RichEmbed} embed
     */
    constructor(embed: RichEmbed) {
        super();
        this.embed = embed;
    }

    public async respond(message: Message): Promise<void> {
        message.channel.send("", { embed: this.embed });
    }
}
