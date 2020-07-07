import { SettingsStrategy } from "../../interfaces/settings.interface";
import { Config } from "../../interfaces/bot.interface";
import { InvalidSyntax } from "../../exceptions/common";

export default class CommonGame implements SettingsStrategy {
    isSyntaxValid(pieces: string[]): boolean {
        if (pieces.length >= 2) {
            return true;
        } else {
            throw new InvalidSyntax();
        }
    }

    updateConfig(config: Config, pieces: string[]): Config {
        const key = pieces[0] as "mh4u" | "mhgen" | "mhgu" | "mhxx";
        const value = pieces[1];

        config.games[key].channel = value;

        return config;
    }
}
