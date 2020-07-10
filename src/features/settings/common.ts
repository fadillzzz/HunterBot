import { SettingsStrategy } from "../../interfaces/settings.interface";
import { Config } from "../../interfaces/bot.interface";
import { InvalidSyntax } from "../../exceptions/common";
import { InvalidOption } from "../../exceptions/settings";
import Base from "./base";

export default class Common extends Base implements SettingsStrategy {
    public isSyntaxValid(pieces: string[]): boolean {
        if (pieces.length >= 2) {
            this.isOptionValid(pieces[0]);
            return true;
        } else {
            throw new InvalidSyntax();
        }
    }

    public updateConfig(config: Config, pieces: string[]): Config {
        const key = pieces[0] as "prefix" | "listenChannel" | "timer";
        const value = pieces[1];

        if (key === "timer") {
            config.timer = Number(pieces[1]);
        } else {
            config[key] = value;
        }

        return config;
    }

    protected validOptions(): string[] {
        return ["prefix", "listenChannel", "timer"];
    }

    public commandHelpEmbedField(commandName: string): { name: string; value: string } {
        return {
            name: `:arrow_forward: Meta: \`${commandName} <prefix/listenChannel/timer> <value>\``,
            value: `\`listenChannel\` expects the channel ID.\n\`timer\` controls the time before hub automatically expires (in seconds).`,
        };
    }
}
