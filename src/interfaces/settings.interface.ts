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

    /**
     * Check if the given option is valid. May throw an exception.
     *
     * @param {String} option
     * @return {Boolean}
     */
    isOptionValid(option: string): boolean;

    /**
     * Returns the command embed field for the given set of options
     *
     * @param {String} commandName
     * @return { name: String, value: String }
     * @Todo This should be its own interface
     */
    commandHelpEmbedField(commandName: string): { name: string; value: string };
}
