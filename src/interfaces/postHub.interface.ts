import { Message } from "discord.js";
import { HubConfig, HubPrototype } from "./hub.interface";

export interface MHWConfig {
    channels: {
        xbox: string;
        ps4: string;
        pc: string;
    };
}

export interface CommonConfig {
    channel: string;
}

export interface PostHubConfig extends HubConfig {
    games: {
        mhw: MHWConfig;
        mh4u: CommonConfig;
        mhxx: CommonConfig;
        mhgu: CommonConfig;
        mhgen: CommonConfig;
    };
}

export interface PostHubStrategy {
    /**
     * Sets the message property
     *
     * @return {this}
     */
    setMessage(message: Message): this;

    /**
     * Validates command syntax
     *
     * @return {Boolean}
     */
    isSyntaxValid(): boolean;

    /**
     * Parses the hub password
     *
     * @return {String|Null}
     */
    parsePassword(): string | null;

    /**
     * Returns hub info from the given message
     *
     * @return {HubPrototype}
     */
    extractHubInfo(): HubPrototype;

    /**
     * Returns the channel ID to which we'll be posting hubs
     *
     * @return {String}
     */
    getTargetChannelId(): string;

    /**
     * Returns the command help message for the given game "type"
     *
     * @param {String} commandName
     * @return {Object}
     */
    commandHelpEmbedField(commandName: string): {name: string; value: string;};
}
