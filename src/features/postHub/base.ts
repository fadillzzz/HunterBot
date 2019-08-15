import { Message } from "discord.js";
import { HubPrototype } from "../../interfaces/hub.interface";

export default abstract class Base {
    /**
     * A reference to the user's message
     *
     * @var {Message}
     */
    protected message!: Message;

    /**
     * Message string separated into array by space
     *
     * @var {String[]}
     */
    protected pieces!: string[];

    public setMessage(message: Message): this {
        this.message = message;
        this.pieces = message.content.split(" ").map(piece => piece.trim());
        return this;
    }

    public extractHubInfo(): Partial<HubPrototype> {
        return {
            id: this.pieces[2],
            pass: this.parsePassword(),
            description: this.pieces.slice(4).join(" "),
            author: {
                id: this.message.author.id,
                tag: this.message.author.tag,
                displayAvatarURL: this.message.author.displayAvatarURL,
            },
        };
    }

    public abstract parsePassword(): string | null;
}
