import { Config } from "./bot.interface";

export interface SettingsStrategy {
    /**
     * Check the validity of the given syntax. Will throw an exception if it's invalid.
     *
     * @param {String[]} pieces
     * @return {Boolean}
     */
    isSyntaxValid(pieces: string[]): boolean;

    /**
     * Updates the given config based on the input received.
     * Despite the return value, config should be passed by reference.
     *
     * @param {Config} config
     * @param {String[]} pieces
     * @return {this}
     */
    updateConfig(config: Config, pieces: string[]): Config;
}
