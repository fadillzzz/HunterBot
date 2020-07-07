import { SettingsStrategy } from "../../interfaces/settings.interface";
import { Config } from "../../interfaces/bot.interface";
import { InvalidSyntax } from "../../exceptions/common";

export default class Common implements SettingsStrategy {
    isSyntaxValid(pieces: string[]): boolean {
        if (pieces.length >= 2) {
            return true;
        } else {
            throw new InvalidSyntax();
        }
    }

    updateConfig(config: Config, pieces: string[]): Config {
        const key = pieces[0] as "prefix" | "listenChannel" | "timer";
        const value = pieces[1];

        if (key === "timer") {
            config.timer = Number(pieces[1]);
        } else {
            config[key] = value;
        }

        return config;
    }
}
