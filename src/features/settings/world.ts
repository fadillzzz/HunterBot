import { SettingsStrategy } from "../../interfaces/settings.interface";
import { Config } from "../../interfaces/bot.interface";
import { InvalidSyntax } from "../../exceptions/common";

export default class World implements SettingsStrategy {
    isSyntaxValid(pieces: string[]): boolean {
        if (pieces.length >= 3) {
            if (["xbox", "ps4", "pc"].includes(pieces[1])) {
                return true;
            }
        }

        throw new InvalidSyntax();
    }

    updateConfig(config: Config, pieces: string[]): Config {
        const key = pieces[1] as "xbox" | "ps4" | "pc";
        const value = pieces[2];

        config.games.mhw.channels[key] = value;

        return config;
    }
}
