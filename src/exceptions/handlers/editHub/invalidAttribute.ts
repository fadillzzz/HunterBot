import { Message } from "discord.js";
import { ErrorHandler } from "../../../interfaces/exception.interface";
import { InvalidAttribute } from "../../editHub";
import Base from "../base";

export default class InvalidAttributeHandler extends Base implements ErrorHandler {
    /**
     * Valid attributes to display in case of an attribute error
     *
     * @var {String[]}
     */
    private validAttributes: string[] = [];

    protected errorType = InvalidAttribute;

    public async respond(message: Message): Promise<void> {
        message.channel.send(`Valid attributes are: ${this.validAttributes.join(", ")}`, {
            reply: message.author,
        });
    }

    /**
     * Set valid attributes
     *
     * @param {String[]} validAttributes
     * @return {this}
     */
    public setValidAttributes(validAttributes: string[]): this {
        this.validAttributes = validAttributes;
        return this;
    }
}
