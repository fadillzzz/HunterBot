import { Message } from "discord.js";

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

    /**
     * List of attributes that can be updated
     *
     * @var {String[]}
     */
    protected updatableAttributes!: string[];

    public setMessage(message: Message): this {
        this.message = message;
        this.pieces = message.content.split(" ").map(piece => piece.trim());
        return this;
    }

    /**
     * Check if the given syntax is valid
     *
     * @return {Boolean}
     */
    public abstract isSyntaxValid(): boolean;

    /**
     * Returns an object that represents the key/value pair that needs to be updated for the hub
     *
     * @return {Object}
     */
    public abstract getUpdatedInfo(): { [key: string]: string | null };

    /**
     * Returns all attributes that can be updated for the given game
     *
     * @return {String[]}
     */
    public getUpdatableAttributes(): string[] {
        return this.updatableAttributes;
    }
}
